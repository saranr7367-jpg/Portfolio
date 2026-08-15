/**
 * data.js — Default Portfolio Data for Saran R
 * All content is stored here and overridden by localStorage when edits are saved.
 */

const DEFAULT_DATA = {
  projects: [
    {
      title: "CRISPR-Based Gene Editing for Antibiotic Resistance",
      category: "Molecular Biology",
      description: "Investigated CRISPR-Cas9 mediated knockdown of beta-lactamase genes in E. coli strains, achieving up to 78% reduction in MIC values against ampicillin.",
      tags: ["CRISPR", "E. coli", "Antibiotic Resistance", "Molecular Biology"],
      link: "",
      status: "Completed",
      year: "2024"
    },
    {
      title: "Microplastic Bioaccumulation in Marine Phytoplankton",
      category: "Environmental Biotech",
      description: "Quantified uptake rates of polystyrene nanoplastics in Chlorella vulgaris using fluorescence microscopy and flow cytometry, proposing bioremediation strategies.",
      tags: ["Marine Biology", "Microplastics", "Flow Cytometry", "Bioremediation"],
      link: "",
      status: "Completed",
      year: "2024"
    },
    {
      title: "ML-Driven Protein Structure Prediction Pipeline",
      category: "Computational Biology",
      description: "Built an automated pipeline integrating AlphaFold2 predictions with docking simulations to screen novel drug targets for neurodegenerative diseases.",
      tags: ["AlphaFold", "Python", "Docking", "Machine Learning"],
      link: "",
      status: "In Progress",
      year: "2025"
    },
    {
      title: "Bioplastic Production from Agro-Industrial Waste",
      category: "Industrial Biotech",
      description: "Optimized PHB (polyhydroxybutyrate) production parameters in Bacillus megaterium using sugarcane bagasse as a carbon source, achieving 34% cell dry weight.",
      tags: ["PHB", "Bioplastics", "Fermentation", "Sustainable Bio"],
      link: "",
      status: "Completed",
      year: "2023"
    },
    {
      title: "Smart Biosensor for Early Cancer Biomarker Detection",
      category: "Biosensing",
      description: "Designed an electrochemical biosensor functionalized with aptamers for sensitive detection of CEA and PSA cancer biomarkers at sub-nanomolar concentrations.",
      tags: ["Biosensor", "Aptamer", "Electrochemistry", "Cancer Diagnostics"],
      link: "",
      status: "Ongoing",
      year: "2025"
    },
    {
      title: "Probiotic Strain Optimization for Gut Microbiome Health",
      category: "Microbiology",
      description: "Characterized and optimized Lactobacillus rhamnosus fermentation conditions to maximize viable cell counts and biofilm inhibition properties.",
      tags: ["Probiotics", "Gut Microbiome", "Fermentation", "Lactobacillus"],
      link: "",
      status: "Completed",
      year: "2023"
    }
  ],

  writings: [
    {
      title: "The Ethical Frontier of CRISPR-Based Human Germline Editing",
      publication: "Bioethics Review",
      date: "March 2025",
      abstract: "A critical analysis of recent germline editing trials, examining regulatory frameworks across jurisdictions and proposing an international bioethics governance model.",
      tags: ["CRISPR", "Bioethics", "Gene Editing", "Policy"],
      link: "",
      type: "Opinion Piece"
    },
    {
      title: "Microbiome Dysbiosis and Its Role in Metabolic Syndrome: A Systematic Review",
      publication: "Journal of Metabolic Research",
      date: "November 2024",
      abstract: "Systematic review of 42 clinical studies examining associations between gut microbiome composition and onset of type 2 diabetes, obesity, and dyslipidemia.",
      tags: ["Microbiome", "Metabolic Syndrome", "Systematic Review", "Gut Health"],
      link: "",
      type: "Review Article"
    },
    {
      title: "Synthetic Biology: Engineering Life for Sustainable Industry",
      publication: "Medium — BioTechFrontier",
      date: "July 2024",
      abstract: "Exploring how synthetic biology tools — from metabolic engineering to cell-free systems — are reshaping industrial manufacturing toward a bio-based circular economy.",
      tags: ["Synthetic Biology", "Sustainability", "Industrial Biotech"],
      link: "",
      type: "Blog Post"
    },
    {
      title: "Bacteriophage Therapy: A Renaissance in the Post-Antibiotic Era",
      publication: "Infectious Disease Perspectives",
      date: "February 2024",
      abstract: "Review of clinical trials and compassionate-use cases demonstrating phage therapy's efficacy against multidrug-resistant pathogens, with translational outlook.",
      tags: ["Phage Therapy", "AMR", "Clinical Trials", "Microbiology"],
      link: "",
      type: "Review Article"
    }
  ],

  experience: {
    internship: [
      {
        role: "Research Intern",
        org: "Indian Institute of Science (IISc), Bangalore",
        duration: "May 2024 – Jul 2024",
        location: "Bangalore, India",
        description: "Worked under Prof. [Name] in the Molecular Biophysics Unit. Conducted protein crystallization trials, analyzed X-ray diffraction data using CCP4 suite, and contributed to a study on chaperone-assisted protein folding pathways.",
        skills: ["Protein Crystallography", "CCP4", "SDS-PAGE", "Western Blot", "Bioinformatics"]
      },
      {
        role: "Bioinformatics Intern",
        org: "Strand Life Sciences",
        duration: "Dec 2023 – Jan 2024",
        location: "Chennai, India",
        description: "Developed Python scripts for automated variant annotation pipelines using VEP and ANNOVAR. Performed NGS data quality control, alignment (BWA-MEM), and variant calling (GATK HaplotypeCaller).",
        skills: ["Python", "NGS", "GATK", "BWA", "VEP", "Shell Scripting"]
      }
    ],
    work: [
      {
        role: "Junior Research Associate",
        org: "Centre for Cellular and Molecular Biology (CCMB)",
        duration: "Jan 2025 – Present",
        location: "Hyderabad, India",
        description: "Assisting the Genomics and Epigenetics lab in ChIP-seq experiments targeting histone modification patterns in stress-induced cellular responses. Responsible for library preparation and bioinformatic analysis.",
        skills: ["ChIP-seq", "Library Prep", "R/Bioconductor", "Epigenetics", "Cell Culture"]
      }
    ],
    entrepreneurial: [
      {
        role: "Co-Founder & Chief Science Officer",
        org: "BioNova Solutions",
        duration: "Aug 2024 – Present",
        location: "Remote (India)",
        description: "Co-founded a biotech startup focused on affordable biosensor diagnostics for rural healthcare. Led the technical R&D team, secured seed funding through an incubator program, and filed a provisional patent for our aptamer-based lateral flow assay technology.",
        skills: ["Startup Leadership", "R&D Strategy", "Patent Filing", "Grant Writing", "Team Building"]
      }
    ]
  }
};
