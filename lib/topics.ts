const TOPIC_KEYWORDS: Record<string, string[]> = {
  "Photosynthesis": ["photosynthesis", "chlorophyll", "chloroplast", "light-dependent", "calvin", "rubisco", "DCPIP", "Hill reaction", "wavelength of light"],
  "Respiration": ["respiration", "krebs", "glycolysis", "mitochondri", "electron transport", "ATP", "anaerobic", "aerobic", "yeast"],
  "Genetics & Inheritance": ["allele", "genotype", "phenotype", "dominant", "recessive", "linkage", "epistas", "chi-squared", "punnett", "monohybrid", "dihybrid", "Mendel"],
  "Cell division & Meiosis": ["meiosis", "mitosis", "chromosome", "chiasma", "crossing over", "centromere", "spindle", "homologous"],
  "DNA, Genes & Protein synthesis": ["DNA", "RNA", "transcription", "translation", "gene expression", "mRNA", "tRNA", "ribosome", "codon", "mutation", "operon"],
  "Genetic engineering & Biotechnology": ["plasmid", "restriction enzyme", "ligase", "PCR", "gel electrophoresis", "GM", "genetic engineering", "recombinant", "transgenic", "vector", "microarray", "bioinformatics", "gene therapy"],
  "Homeostasis & Excretion": ["homeostas", "kidney", "nephron", "loop of Henle", "ADH", "osmoregulation", "blood glucose", "insulin", "glucagon", "diabetes"],
  "Nervous system & Neurones": ["neurone", "synapse", "synaptic", "action potential", "myelin", "saltatory", "neurotransmitter", "acetylcholin", "Parkinson", "dopamine", "reflex"],
  "Muscles & Movement": ["muscle", "sarcomere", "actin", "myosin", "sliding filament", "tropomyosin", "Z line", "neuromuscular"],
  "Hormones & Coordination": ["hormone", "endocrine", "auxin", "gibberell", "abscisic", "phytochrome", "florigen"],
  "Ecology": ["ecosystem", "community", "biodiversity", "niche", "succession", "biomass", "food web", "trophic", "carbon cycle", "nitrogen cycle"],
  "Evolution & Selection": ["evolution", "natural selection", "founder effect", "genetic drift", "Hardy-Weinberg", "speciation", "allopatric", "sympatric", "Darwin"],
  "Conservation": ["conservation", "endangered", "extinction", "captive breeding", "seed bank", "CITES", "biodiversity hotspot"],
  "Classification": ["classification", "taxonom", "kingdom", "phylum", "domain", "binomial", "Linnaeus"],
  "Immunity": ["immun", "antibod", "antigen", "lymphocyte", "B cell", "T cell", "vaccin", "phagocyt", "MHC"],
};

export function tagTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        tags.push(topic);
        break;
      }
    }
  }
  return tags;
}
