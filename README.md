# TQEC Frontend

In the initial design of the software tools developed by the TQEC community,
we envisioned a graphical frontend to enable the users to build a
QEC code or a fault-tolerant computation by ``drag-and-drop'' graphical
elements on top of a qubit grid.
The frontend is then able to convert the visualization into a library of
templates to be used by the TQEC backend in its compilation.

The integration with the backend into a unique pipeline is currently halted.

**NOTE:** The early development of this frontend is connected to the beginner's guide
of building a project in Javascript using React and Pixi.
The step-by-step guide can still be accessed in the form of commit history from the
[PR #89 page](https://github.com/tqec/tqec/pull/89).



## Installation and execution

From this folder, install by typing:
```bash
npm install
```

Run the app in the development mode by typing:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

Launch the test runner in the interactive watch mode.
```bash
npm test
```
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

Build the app for production to the `build` folder:
```bash
npm run build
```
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!
See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Mock backend

This project provides a mock backend written in Python and located in `<repo>/web`.
It is used to communicate the template structure to the frontend and to receive
the rules to fill the template using the plaquette from the plaquette library.
The plaquette library can be created by the frontend and saved to file.

**TODO:** Allow plaquette library to be loaded from backend too.


## Learn More

Main [TQEC repository](https://github.com/tqec/tqec).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
