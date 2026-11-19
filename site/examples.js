// Fictional descriptions written for the public interface demonstration.
// Each entry describes an interaction; there are no measurement or solution files.
globalThis.interfaceExamples = [
  {
    id: "demo-wall-scale",
    title: "Estimate a wall's temperature scale",
    design: "Illustrative insulated wall",
    family: "Steady heat conduction",
    target: "Boundary value",
    model: "A one-dimensional wall has a prescribed temperature on its left face and an unknown temperature on its right face.",
    observation: "A task brief would describe the position and reading of an interior thermometer.",
    prediction: "Return one estimated right-face temperature.",
    check: "Predict the temperature at a second interior location."
  },
  {
    id: "demo-echo-position",
    title: "Locate an echo in a tube",
    design: "Illustrative acoustic tube",
    family: "Acoustic scattering",
    target: "Position",
    model: "A pulse travels along an ideal tube and reflects from a single partition. The sound speed is known.",
    observation: "A task brief would specify a pulse emission time and the arrival time of the first returning echo.",
    prediction: "Return the estimated distance to the partition.",
    check: "Use that distance to predict the round-trip travel time."
  }
];
