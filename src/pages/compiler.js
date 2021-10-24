import React, { useState, useEffect } from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap } from "fluid-framework";

const client = new TinyliciousClient();
const containerSchema = {
    initialObjects: { sharedInput: SharedMap },
};

const fluidKey = "input";

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
                    "2a3d3dfb60mshcff5d7b612c90abp146cf6jsnefb8b730db97",
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
                        "2a3d3dfb60mshcff5d7b612c90abp146cf6jsnefb8b730db97",
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
            <div className="row container-fluid">
                <div className="col-6 ml-4 ">
                    <textarea
                        required
                        name="code"
                        value={input}
                        onChange={(e) => handleInputChange(e)}
                    ></textarea>
                    <button
                        type="submit"
                        className="btn btn-danger ml-2 mr-2 "
                        onClick={(e) => submit(e)}
                    >
                        <i className="fas fa-cog fa-fw"></i> Run
                    </button>
                </div>
                <div className="col-5">
                    <div>
                        <span className="badge badge-info heading my-2 ">
                            <i className="fas fa-exclamation fa-fw fa-md"></i>{" "}
                            Output
                        </span>
                        <textarea id="output" value={output}></textarea>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Compiler;
