require('dotenv').config();

const apiKey = process.env.REACT_APP_API_KEY;

export async function strict_output(systemPrompt, userPrompt, outputFormat, defaultCategory = "", outputValueOnly = false,
                  model = 'gpt-3.5-turbo-16k', temperature = 0, numTries = 2, verbose = false) {
    
    /* Ensures that OpenAI will always adhere to the desired output json format. 
    Uses rule-based iterative feedback to ask GPT to self-correct.
    Keeps trying up to numTries if it does not. Returns empty json if unable to after numTries iterations.
    If output field is a list, will treat as a classification problem and output best classification category.
    Text enclosed within < > will be generated by GPT accordingly*/

    // if the user input is in a list, we also process the output as a list of json
    const listInput = Array.isArray(userPrompt);
    // if the output format contains dynamic elements of < or >, then add to the prompt to handle dynamic elements
    const dynamicElements = outputFormat.includes('<');
    // if the output format contains list elements of [ or ], then we add to the prompt to handle lists
    const listOutput = outputFormat.includes('[');
    
    // start off with no error message
    let errorMsg = '';
    
    for (let i = 0; i < numTries; i++) {
        
        let outputFormatPrompt = `\nUse the following json format: \n\n ${outputFormat}`;
        
        if (listOutput) {
            outputFormatPrompt += `\nIf output field is a list, classify output into the best element of the list.`;
        }
        
        // if outputFormat contains dynamic elements, process it accordingly
        if (dynamicElements) { 
            outputFormatPrompt += ` 
            Any text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden
            Any output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
        }

        // if input is in a list format, ask it to generate json in a list
        if (listInput) {
            outputFormatPrompt += `\nGenerate a list of json, one json for each input element.`;
        }
        
        // Use OpenAI to get a response
        const response = await client.chat.completions.create({
          temperature: temperature,
          max_tokens: 5200,
          model: model,
          messages: [
            {"role": "system", "content": systemPrompt + outputFormatPrompt + errorMsg},
            {"role": "user", "content": userPrompt}
          ]
        });
        let res = response.choices[0].message.content.replace(/\'/g, '"');
        
        // ensure that we don't replace away apostrophes in text 
        res = res.replace(/(\w)\"(\w)/g, '$1\'$2');

        if (verbose) {
            console.log('System prompt:', systemPrompt + outputFormatPrompt + errorMsg);
            console.log('\nUser prompt:', userPrompt);
            console.log('\nGPT response:', res);
        }
        
        // try-catch block to ensure output format is adhered to
        try {
            let output = JSON.parse(res);
            if (Array.isArray(userPrompt)) {
                if (!Array.isArray(output)) throw new Error("Output format not in a list of json");
            } else {
                output = [output];
            }
            
            // check for each element in the output_list, the format is correctly adhered to
            for (let index = 0; index < output.length; index++) {
                for (const key in outputFormat) {
                    // unable to ensure accuracy of dynamic output header, so skip it
                    if (key.includes('<') || key.includes('>')) continue;
                    // if output field missing, raise an error
                    if (!(key in output[index])) throw new Error(`${key} not in json output`);
                    // check that one of the choices given for the list of words is an unknown
                    if (Array.isArray(outputFormat[key])) {
                        const choices = outputFormat[key];
                        // ensure output is not a list
                        if (Array.isArray(output[index][key])) {
                            output[index][key] = output[index][key][0];
                        }
                        // output the default category (if any) if GPT is unable to identify the category
                        if (!choices.includes(output[index][key]) && defaultCategory) {
                            output[index][key] = defaultCategory;
                        }
                        // if the output is a description format, get only the label
                        if (output[index][key].includes(':')) {
                            output[index][key] = output[index][key].split(':')[0];
                        }
                    }
                }
                // if we just want the values for the outputs
                if (outputValueOnly) {
                    output[index] = Object.values(output[index]);
                    // just output without the list if there is only one element
                    if (output[index].length === 1) {
                        output[index] = output[index][0];
                    }
                }
            }
            
            return listInput ? output : output[0];

        } catch (e) {
            errorMsg = `\n\nResult: ${res}\n\nError message: ${e.toString()}`;
            console.error("An exception occurred:", e.toString());
            console.error("Current invalid json format:", res);
        }
    }
    
    return {};
}

export async function gptRequest(pdfConvertedToText, jsonData) {
    const text = pdfConvertedToText;
    
    const res = await strict_output(
        /* System Prompt */ `You are an assistant meant to extract data from a text pdf, separated by chunks of text. Every time a chunk is passed, copy the previous json and add the new data.`,
        /* User Prompt */ text,
        /* Output Format */ jsonData,
        /* Default Category */ "null"
    );

    return res;
}
