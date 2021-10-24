import React, { useState, useEffect } from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap } from "fluid-framework";

import logo from "../assets/logo.png";

const client = new TinyliciousClient();
const containerSchema = {
    initialObjects: { sharedInput: SharedMap },
};

const fluidKey = "input";
const apiKey = "YOUR-JUDGE0-API-KEY";

const getFluidData = async () => {
    let container;
    const containerId = window.location.hash.substring(1);
    if (!containerId) {
        ({ container } = await client.createContainer(containerSchema));
        container.initialObjects.sharedInput.set(
            fluidKey,
            "print('Hello World')"
        );
        const id = await container.attach();
        window.location.hash = id;
    } else {
        ({ container } = await client.getContainer(
            containerId,
            containerSchema
        ));
    }
    return container.initialObjects;
};

function Compiler() {
    const [input, setInput] = useState(undefined);
    const [output, setOutput] = useState(undefined);

    const [fluidSharedObjects, setFluidSharedObjects] = useState();

    useEffect(() => {
        getFluidData().then((data) => setFluidSharedObjects(data));
    }, []);

    useEffect(() => {
        if (fluidSharedObjects) {
            const { sharedInput } = fluidSharedObjects;
            const updateLocalInput = () => setInput(sharedInput.get(fluidKey));

            updateLocalInput();

            sharedInput.on("valueChanged", updateLocalInput);

            return () => {
                sharedInput.off("valueChanged", updateLocalInput);
            };
        } else {
            return; // Do nothing because there is no Fluid SharedMap object yet.
        }
    }, [fluidSharedObjects]);

    const handleInputChange = (e) => {
        fluidSharedObjects.sharedInput.set(fluidKey, e.target.value);
    };

    const requestBody = {
        language_id: 71,
        source_code: input,
        stdin: "",
    };

    const submit = (e) => {
        console.log("input: ", input);
        e.preventDefault();
        fetch("https://judge0-ce.p.rapidapi.com/submissions", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                "x-rapidapi-key":
                    apiKey,
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => response.json())
            .then((response) => {
                parseResponse(response);
            })
            .catch((err) => {
                console.error(err);
            });
    };
    const parseResponse = (response) => {
        console.log("response token: " + response.token);
        if (response.token) {
            let url = `https://judge0-ce.p.rapidapi.com/submissions/${response.token}?base64_encoded=true`;
            fetch(url, {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                    "x-rapidapi-key":
                        apiKey,
                    "content-type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((response) => {
                    console.log("stdout: " + response.stdout);
                    if (response.stdout) {
                        const buf = Buffer.from(response.stdout, "base64");
                        const outputString = buf.toString("utf8");
                        setOutput(
                            `Results :\n${outputString}\nExecution Time : ${response.time} Secs\nMemory used : ${response.memory} bytes`
                        );
                        console.log("output: " + output);
                    } else if (response.stderr) {
                        const buf = Buffer.from(response.stderr, "base64");
                        const error = buf.toString("utf8");
                        setOutput(`\n Error :${error}`);
                    } else {
                        const buf = Buffer.from(
                            response.compile_output,
                            "base64"
                        );
                        const compilation_error = buf.toString("utf8");
                        setOutput(`\n Error :${compilation_error}`);
                    }

                    console.log(JSON.stringify(response));
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    };

    if (!input) {
        return <div />;
    }

    return (
        <>
            <img
                className="w-full h-32 object-contain bg-gray-100"
                src={logo}
                alt="logo"
            />
            <div className="px-6 bg-gray-100 flex items-center justify-center">
                <div className="container max-w-screen-lg mx-auto">
                    <div class="bg-light-blue rounded shadow-lg">
                        <div className="text-white">
                            <textarea
                                className="p-2 bg-light-blue w-full resize-none rounded text-sm"
                                required
                                rows="7"
                                name="code"
                                value={input}
                                onChange={(e) => handleInputChange(e)}
                            ></textarea>
                            <button
                                className="bg-blue-300 justify-self-end float-right hover:bg-blue-500 text-white font-bold my-2 mr-1 px-3 rounded"
                                type="submit"
                                onClick={(e) => submit(e)}
                            >
                                Run
                            </button>
                        </div>
                        <textarea
                            className="bg-black w-full p-2 bg-opacity-40 resize-none rounded align-top align-bottom overflow-auto text-sm text-white"
                            id="output"
                            rows="4"
                            value={output}
                        ></textarea>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Compiler;
