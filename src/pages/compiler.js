import React, { useState, useEffect } from "react";

function Compiler() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");

    const requestBody = {
        language_id: 71,
        source_code: input,
        stdin: "",
    };

    const submit = async (e) => {
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
            .then((response) => {
                parseResponse(response);
                console.log(response);
            })
            .catch((err) => {
                console.error(err);
            });
    };
    const parseResponse = async (response) => {
        const jsonResponse = await response.json();
        let jsonGetSolution = {
            status: { description: "Queue" },
            stderr: null,
            compile_output: null,
        };
        while (
            jsonGetSolution.status.description !== "Accepted" &&
            jsonGetSolution.stderr == null &&
            jsonGetSolution.compile_output == null
        ) {
            console.log(jsonGetSolution);
            if (jsonResponse.token) {
                let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;
                const getSolution = await fetch(url, {
                    method: "GET",
                    headers: {
                        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                        "x-rapidapi-key":
                            "2a3d3dfb60mshcff5d7b612c90abp146cf6jsnefb8b730db97",
                        "content-type": "application/json",
                    },
                });
                jsonGetSolution = await getSolution.json();
            }
        }

        if (jsonGetSolution.stdout) {
            const buf = Buffer.from(jsonGetSolution.stdout, "base64");
            const output = buf.toString("base64");
            setOutput(
                `Results :\n${output}\nExecution Time : ${jsonGetSolution.time} Secs\nMemory used : ${jsonGetSolution.memory} bytes`
            );
        } else if (jsonGetSolution.stderr) {
            const buf = Buffer.from(jsonGetSolution.stderr, "base64");
            const error = buf.toString("base64");
            setOutput(`\n Error :${error}`);
        } else {
            const buf = Buffer.from(jsonGetSolution.compile_output, "base64");
            const compilation_error = buf.toString("base64");
            setOutput(`\n Error :${compilation_error}`);
        }
    };

    const handleInputChange = (e) => {
        console.log(e.target.value);
        setInput(e.target.value);
    };

    return (
        <>
            <div className="row container-fluid">
                <div className="col-6 ml-4 ">
                    <textarea
                        required
                        name="code"
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
                        <textarea id="output">{output}</textarea>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Compiler;
