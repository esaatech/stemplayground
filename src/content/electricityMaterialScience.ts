/**
 * Long-form copy for the Electricity Flow Simulator “More” dialogs.
 * Short summaries stay in ElectricityFlowDemo (MATERIAL_SCIENCE_NOTE).
 */

export type ElectricityMaterial = "copper" | "wood" | "plastic";

export const MATERIAL_NOTE_IMAGE_BASE = "/images/engineering/electricity/material-notes/";

/** Try these in order until one loads (or show placeholder). */
export function materialNoteImageCandidates(material: ElectricityMaterial): string[] {
  const b = MATERIAL_NOTE_IMAGE_BASE;
  return [`${b}${material}.png`, `${b}${material}.jpg`, `${b}${material}.webp`];
}

export type MaterialScienceDetail = {
  dialogTitle: string;
  paragraphs: string[];
  imageAlt: string;
};

export const MATERIAL_SCIENCE_DETAIL: Record<ElectricityMaterial, MaterialScienceDetail> = {
  copper: {
    dialogTitle: "Copper: a conductor",
    imageAlt: "Diagram or photo illustrating free electron drift in a metal (optional illustration)",
    paragraphs: [
      "Copper is a metal. In the simplified picture used in many classrooms, a metal contains a regular lattice of positive ions surrounded by a “sea” of electrons that are not tied to one atom forever. Those electrons can pick up energy from an electric field and drift through the crystal, producing electric current.",
      "When no voltage is applied, that sea still has thermal energy: electrons scatter off vibrations and imperfections, so their velocity keeps changing and their paths look random. That is not current in the circuit sense, because there is no net motion in one direction averaged over the whole wire.",
      "When you do apply a push (voltage), the same random motion is biased slightly in one direction. Many small drifts add up to a macroscopic current. Good conductors like copper have high conductivity: a modest push produces a large current for a given geometry and temperature.",
      "In this lab, copper uses freer wandering along the path and periodic wrap as a cartoon for “charges can travel through the wire.” The ammeter and bulb are still a teaching model, not a measurement of a real lab circuit.",
      "Real-world extras: resistance rises with temperature; impurities and grain boundaries scatter electrons; very thin wires and skin effects matter at high frequency. For introductory STEM, the key idea is: mobile carriers plus bias produce current.",
    ],
  },
  wood: {
    dialogTitle: "Wood: between metal and insulator",
    imageAlt: "Diagram of cellulose / porous wood structure or moisture path (optional illustration)",
    paragraphs: [
      "Dry wood is mostly organic polymers (for example cellulose and lignin) with no metallic electron sea. Charges are involved in covalent bonds and localized states, so they cannot drift through a block of wood the way they drift through copper.",
      "Wood is also porous and can absorb water. Water with dissolved ions can conduct a little, so wet wood behaves differently from very dry wood. Charred wood or wood with salts can conduct more. That is why we treat wood here as “harder than copper, easier than plastic” — a pedagogical middle, not a single universal constant.",
      "With no push, thermal motion still exists: atoms vibrate and charge clouds wiggle, but organized bulk drift through the material is weak. With a push, a tiny polarization or leakage current can exist in real samples; in this simulation we mainly show weaker flow and more localization than in copper.",
      "In the lab animation, wood uses moderate jitter, a light spring toward local sites, and still wraps along the wire path as a compromise cartoon. Compare it to copper (easy flow) and plastic (almost no useful current).",
      "Takeaway: wood is not modeled as a neat copper wire; think messy structure, bound charges, and sometimes moisture, so do not expect the same current as in a metal unless conditions change.",
    ],
  },
  plastic: {
    dialogTitle: "Plastic: an insulator",
    imageAlt: "Diagram of tightly bound electrons / large band gap in a polymer (optional illustration)",
    paragraphs: [
      "Plastics are usually polymers with covalent bonds holding electrons in localized molecular orbitals. In the introductory picture, those electrons are tightly bound: they participate in bonding and do not form a free sea like in a metal.",
      "At room temperature, a good plastic has essentially no mobile charge carriers that can drift through the bulk under a modest field. In a more advanced (quantum) description, the band gap is large, so electrons do not populate the conduction band in useful numbers. Current through the bulk is therefore tiny compared with a metal wire of the same size.",
      "That does not mean “nothing moves.” Atoms still vibrate with thermal energy; charge clouds still jiggle around their equilibrium positions. What is missing is coordinated drift of many charges through the material — the thing we call useful conduction in this lesson.",
      "In this simulation, plastic uses small random kicks, a stronger spring back toward a local “site,” stronger damping, bounce at the ends of the path instead of endless wrap, and low conductivity on the meter. Together that reads as: vibration without an easy trip through the wire.",
      "Safety note: “Insulator” does not mean “safe to touch live wires.” Plastics can break down, carbonize, or conduct if contaminated, wet, or damaged. Always follow real lab and home electrical safety rules.",
      "Takeaway: insulator means bound charges, a large gap, and almost no bulk drift; there is still thermal motion, and almost no organized current in this model.",
    ],
  },
};
