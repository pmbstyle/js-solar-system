# Three.js Solar System Simulation

This project is a 3D simulation of the Solar System, built using Three.js and Vite. It features an interactive model of the solar system, including the Sun, eight planets, and the Moon, with realistic textures and orbits.

## Features

- Realistic textures for the Sun, planets, and Moon.
- Accurate scaling of planets and distances (within visualization constraints).
- Animations for planetary orbits and rotations.
- The Moon orbits around the Earth.
- Interactive camera controls to explore the solar system.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need Node.js and npm installed on your system to run the project. You can download and install them from [Node.js official website](https://nodejs.org/).

### Installation

To set up the project locally, follow these steps:

1. Clone the repository to your local machine:

```bash
git clone https://github.com/pmbstyle/js-solar-system.git
cd js-solar-system
```

2. Install the necessary packages using npm:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

This will start the Vite development server and open the project in your default web browser.

### Building for Production

To build the project for production, run:

```bash
npm run build
```

This will generate a `dist` folder with all the assets and an `index.html` file, ready to be deployed to your web server.

## Usage

After starting the development server, you can:

- Rotate the view by clicking and dragging the mouse.
- Zoom in and out using the mouse wheel or trackpad.
- [TODO] Click on planets to get more information (feature to be implemented).


## Acknowledgments

- Textures sourced from [Solar System Scope](https://www.solarsystemscope.com/textures/).
- Three.js library for 3D graphics on the web.
