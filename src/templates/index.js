import { useApp } from '@pixi/react'
import { useState, useEffect } from 'react'
import { makeGrid } from '../library/grid'
import { Container, Graphics } from 'pixi.js'
import Position from '../library/position'
import { button } from '../library/button'
import Plaquette from '../library/plaquette'
import PlaquetteType from '../code/plaquette-type'
import Circuit from '../library/circuit'
import { savedPlaquettes, libraryColors } from '../library'
import { Qubit } from '../library/qubit'
import { GRID_SIZE_TEMPLATE_WORKSPACE, GUIDE_TOP_LEFT_CORNER_TEMPLATE_WORKSPACE } from '../constants'

import config from '../components/download/config'
import { postExample, getExample } from '../components/download/test-backend-interface'

/////////////////////////////////////////////////////////////

export default function TqecTemplates() {
	// Initialize the app
	let app = useApp();

	// Remove all children from the stage to avoid rendering issues
	app.stage.removeChildren();
	const gridSize = GRID_SIZE_TEMPLATE_WORKSPACE;
	const qubitRadius = 7;
	document.getElementById('dxCell').value = 2;
	document.getElementById('dyCell').value = 2;
	let plaquetteDx = parseInt(document.getElementById('dxCell').value);
	let plaquetteDy = parseInt(document.getElementById('dyCell').value);

	// Create the workspace
	const workspace = new Container();
	workspace.name = 'workspace-code';

	// Create the grid container
	const grid = makeGrid(app, gridSize);
	// We want the grid to be in the lowest layer
    workspace.addChildAt(grid, 0);

/////////////////////////////////////////////////////////////

	// Add guide for the eyes for the plaquette boundaries.
	// They are located via the position of the top, left corner.
	// The first guide is where the plaquette is built, the other guides are for the library.
	const guideTopLeftCorner = GUIDE_TOP_LEFT_CORNER_TEMPLATE_WORKSPACE;
	let libraryTopLeftCorners = [[21, 3], [21, 7], [21, 11], [21, 15]];
	const outline = new Graphics();
	outline.clear()
	outline.lineStyle(2, 'lightcoral');
	workspace.addChild(outline);

/////////////////////////////////////////////////////////////

	// Add qubit positions to the workspace
	for (let x = 0; x <= app.screen.width/gridSize; x += 1) {
		for (let y = 0; y <= app.screen.height/gridSize; y += 1) {
			// Skip every other qubit
            if ( (x+y) % 2 === 1 )
	            continue;
			// Create a qubit
			const pos = new Position(x*gridSize, y*gridSize, qubitRadius-2);
			workspace.addChild(pos);
		}
	}
	const num_background_children = workspace.children.length;

/////////////////////////////////////////////////////////////

	const testButton = button('test of API to interface with API', gridSize, 1*gridSize, 'orange', 'black');
	workspace.addChild(testButton);

	const getButton = button('GET button test', gridSize, 2*gridSize, 'white', 'black');
	workspace.addChild(getButton);

    // Custom Hook to handle response data
    function useResponseData(responseData) {
        useEffect(() => {
            if (responseData) {
                console.log('Using response data:', responseData);
                // Perform other actions with responseData
				// Add workspace guidelines according to the dimensions in the received json data.
				let y0 = guideTopLeftCorner[1];
				while (y0 + plaquetteDy <= guideTopLeftCorner[1] + 2*responseData.height) {
					let x0 = guideTopLeftCorner[0];
					while (x0 + plaquetteDx <= guideTopLeftCorner[0] + 2*responseData.length) {
						console.log('draw outline with topleft at:', x0, '  ', y0)
						const x1 = x0 + plaquetteDx;
						const y1 = y0 + plaquetteDy;
						outline.moveTo(x0*gridSize, y0*gridSize);
						outline.lineTo(x1*gridSize, y0*gridSize);
						outline.lineTo(x1*gridSize, y1*gridSize);
						outline.lineTo(x0*gridSize, y1*gridSize);
						outline.lineTo(x0*gridSize, y0*gridSize);
						x0 += plaquetteDx;
					}
					y0 += plaquetteDy;
				}
            } else {
                console.log('No data received yet.');
            }
        }, [responseData]); // Trigger effect when responseData changes
    }

    // State to hold response data
    const [responseData, setResponseData] = useState(null);

//    // Function to handle response data from backend
//    function handleResponseData(data) {	
//		responseData = data; // Assign the response data to the global variable.
//		console.log('Received data:', responseData);
//		// Example: Display received data in an HTML element
//		const resultDiv = document.getElementById('result');
//		resultDiv.textContent = JSON.stringify(responseData, null, 2);
//		// Perform actions with response data.
//		useResponseData();
//	}

//    // Function to use the json data received from backend.
//    function useResponseData() {
//        if (responseData) {
//            console.log('Using response data:', responseData);
//        } else {
//            console.log('No data received yet.');
//        }
//    }

	getButton.on('click', (_e) => {
		let url = '/example'
		const localTesting = !window.location.href.includes('https://'); // FIXME: this is a hack
		let backendURL = `${localTesting
		  ? `http://${config.devBackendURL.ip}:${config.devBackendURL.port}`
		  : config.prodBackendURL
		}`;
		backendURL += url;

		// Using the promise approach:
		// getExample returns the data (in json format) which are handled using promises
		// like `.then()` and `.catch()` in the calling de.
		getExample(backendURL)
			.then(data => {
                setResponseData(data); // Update state with response data
				// Example: Display received data in an HTML element
				const resultDiv = document.getElementById('result');
				resultDiv.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
	});

	// Use custom Hook to handle response data
    useResponseData(responseData);

/////////////////////////////////////////////////////////////

	const postButton = button('POST button test', gridSize, 3*gridSize, 'white', 'black');
	workspace.addChild(postButton);

	postButton.on('click', (_e) => {
		let url = '/example'
		const localTesting = !window.location.href.includes('https://'); // FIXME: this is a hack
		let backendURL = `${localTesting
		  ? `http://${config.devBackendURL.ip}:${config.devBackendURL.port}`
		  : config.prodBackendURL
		}`;
		backendURL += url;

		const payload = { name: 'post_example', value: '3.14' };
		postExample(backendURL, payload);
	});

/////////////////////////////////////////////////////////////

	const infoButton = button('Library of plaquettes', libraryTopLeftCorners[0][0]*gridSize, 1*gridSize, 'orange', 'black');
	workspace.addChild(infoButton);

    // Select the qubits that are part of a plaquette 
	const importPlaquettesButton = button('Import plaquettes from composer', gridSize, 5*gridSize, 'white', 'black');
	workspace.addChild(importPlaquettesButton);
	let codePlaquettes = [];

    importPlaquettesButton.on('click', (_e) => {
		plaquetteDx = parseInt(document.getElementById('dxCell').value);
		plaquetteDy = parseInt(document.getElementById('dyCell').value);
		libraryTopLeftCorners = [[21, 3], [21, 3+plaquetteDy+2], [21, 3+(plaquetteDy+2)*2], [21, 3+(plaquetteDy*2)*3]]
		// Add workspace guidelines.
		// TODO: take info from backend
		let message = '';
		// Add library guidelines.
		for (const [x0, y0] of libraryTopLeftCorners) {
			const x1 = x0 + plaquetteDx;
			const y1 = y0 + plaquetteDy;
			outline.moveTo(x0*gridSize, y0*gridSize);
			outline.lineTo(x1*gridSize, y0*gridSize);
			outline.lineTo(x1*gridSize, y1*gridSize);
			outline.lineTo(x0*gridSize, y1*gridSize);
			outline.lineTo(x0*gridSize, y0*gridSize);
		}
        // Create the compact representation of the (empty) QEC code
        const codesummary = document.getElementById('codeSummary');
        codesummary.value = message;
		// Add library plaquettes.
		//const library_workspace = document.getElementsByName('workspace-library');
		let plaquetteTypes = [];
		//const numPlaquettes = savedPlaquettes.length;
		savedPlaquettes.forEach((plaq, index) => {
			if (plaq.name !== 'WIP plaquette') {
				let qubits = [];
				plaq.qubits.forEach((q) => {
					const qubit = new Qubit(q.globalX, q.globalY, q.Radius);
					qubit.name = q.name;
					qubit.updateLabel();
					workspace.addChild(qubit);
					qubits.push(qubit);
				});
				// Recall that plaquette names are like "plaquette 12", starting from "plaquette 1"
				const plaquette_id = parseInt(plaq.name.match(/\d+/)[0]);
				const base_translate_vector = {x: guideTopLeftCorner[0] - libraryTopLeftCorners[plaquette_id-1][0],
				                               y: guideTopLeftCorner[1] - libraryTopLeftCorners[plaquette_id-1][1]};
				const p_type = new PlaquetteType(qubits, libraryColors[index], num_background_children, base_translate_vector)
				p_type.name = plaq.name;
				plaquetteTypes.push(p_type);
				workspace.addChildAt(p_type, num_background_children);
			}
		});
		// FIXME: Some plaquettes in the red-delimited space may already be there.
		//        Compose the compact representation of the code accordingly.
	});

/////////////////////////////////////////////////////////////

    // Undo button, meaning that the last plaquette added is removed.
	const undoButton = button('Remove last plaquette', gridSize, 6*gridSize, 'white', 'black');
	workspace.addChild(undoButton);

    undoButton.on('click', (_e) => {
		if (workspace.children[num_background_children] instanceof Plaquette
			&& !(workspace.children[num_background_children] instanceof PlaquetteType) ) {
			workspace.removeChildAt(num_background_children);
			// FIXME: correct the compact representation of the code!
		}
	});

/////////////////////////////////////////////////////////////

	// Create a button to de-select all qubits 
	const downloadCodeButton = button('Download QEC code', gridSize, 17*gridSize, 'white', 'black');
	workspace.addChild(downloadCodeButton);

	downloadCodeButton.on('click', (_e) => {
		if (codePlaquettes.length === 0) return;
	
		let message = '';
		// Add info on cell size
		message += 'This is the complete QEC code.\n'
		let counter = 0;
		codePlaquettes.forEach((plaq) => {
			if (plaq.name !== 'WIP plaquette') {
				message += '###############\n'
				message += `# plaquette ${counter} #\n`
				message += '###############\n\n'
				plaq.children.forEach((child) => {
					if (child instanceof Circuit) {
						console.log('circuit to add');
						message += child.art.text;
						message += '\n\n\n';
						console.log(message);
					}
				});
				counter += 1;
			}
		});
		const blob = new Blob([message], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'qec_code.txt';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	});

/////////////////////////////////////////////////////////////

    //  Add workspace to the stage
    workspace.visible = true;
	app.stage.addChild(workspace);

    return null;
}
