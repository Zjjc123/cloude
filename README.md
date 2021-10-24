![logo](https://i.imgur.com/LkYPHZN.png)

## Inspiration
As the COVID-19 pandemic continues, more and more courses, lectures, and group projects are moved online. 

- Students now struggle with the ability to quickly and efficiently collaborate on programming problems. 
- Teachers and TA’s now struggle with helping students remotely. 

With everything happening online, we, together with our peers, found it difficult to learn from lectures that are difficult to follow and demos where we can’t see how it was created. 

Current collaboration solutions for programming exist like **GitHub**. But those technologies are not suited for real-time interactions between professors and students. It is hard to comprehend the steps and reasoning just by looking at lines of code. Thus, we were inspired to create a real-time programming collaboration and compilation platform, similar to the idea of **Google Docs** and **Microsoft Office**. 

> We implemented a simple-to-use website with instant real-time syncing of code and browser-side compilation for all students to effectively collaborate and for professors to efficiently educate.

## What it does
We created Cloude to be an instant real-time collaborative online code compiler that not only allows multiple people to efficiently collaborate on code but also constantly syncs the code with all users instantly all without any merging conflicts. 

The user is first faced with a sign-in page where they login using their credentials. After successfully logging in, they are taken to the browser development environment where they can write and run code while having it sync in real-time to all users currently working on the same project. 

All a user has to do to share a project with others is to just share a unique project link that will instantly direct other users to the same code. After the user finishes programming, they have the ability to compile code on the browser directly. Finally, the project is saved on the cloud for later usage. 

## How we built it
1. We first wireframed the sign-in, sign-out, and browser IDE pages for our site using **Figma**. We designed a simple-to-follow general flow user experience and a minimalistic yet beautiful UI. 
2. We then used the popular JavaScript UI library **React.js** combined with the CSS framework **Tailwind.css** to translate the interface into code. We then hooked our website up to an online compilation API with HTTPS fetch calls that allows us to compile code on the browser. 
3. Then we integrated the Microsoft open-source real-time collaboration platform **Fluid Framework** into our project. Fluid Framework provided the server-side logic we used in the backend to effectively sync and update all local clients to provide a seamless collaborative experience. 

### Fluid Framework Code Snippet
```javascript
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

```

## Challenges we ran into
One of the hardest challenges for us was figuring out the Fluid Framework since it is a relatively newer open source project. We reviewed the tutorials, documentation, and examples before having a better idea of where to start. Throughout our programming experience, we had to constantly refer back to different documentation and examples to understand what was going on. 

In addition, fetching the compilation API calls from Judge0 was also difficult as the format of the requests was confusing. We used Postman to experiment with and test different HTTPS requests. We were finally able to figure out the complex API calls by the end.

## Accomplishments that we're proud of
As it was the first time for us working with a new framework like Fluid, understanding the framework was tricky since there were less resources to guide us, and the documentation was not fully completed. We were able to figure out, use, and learn a cutting-edge framework that was recently developed. In addition, React.js is even a newer concept for some of us. Learning the functional API combined with hooks was something we didn’t realize we could’ve done in one day.

## What we learned
We have gained a better understanding of different libraries and frameworks we can use to solve a problem. We figured out how to isolate the benefits and costs of different utilities and development stacks, and how to pick the best ones for different situations. We learned new tools that we can use in the future like Fluid Framework and React.js. We also learned to better delegate tasks and collaborate under time limits and pressure.

## What's next for Cloude
In the future, we hope to implement more languages to run within our program. Although it currently only supports Python, the API we are using supports many other different languages like **Java, C, C#, ** etc. We hope to add different options for more flexible programming. 

We also plan on giving users a variety of settings that they can adjust to their likings, making Cloude a fully functional online IDE. We will allow the user to have more control over the code and access of their projects, allowing them to sort, organize, and manage different projects in different languages. We hope that Cloude will be the number one collaborative online IDE for educational and even professional purposes.

