export interface Scheme {
  slug: string;
  name: string;
  ministry: string;
  category: "income" | "insurance" | "credit" | "irrigation" | "market" | "soil" | "organic";
  eligibility: string;
  benefit: string;
  howToApply: string;
  link: string;
}

/** Curated list of major Indian central-government schemes for farmers. */
export const SCHEMES: Scheme[] = [
  {
    slug: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "income",
    eligibility: "All landholding farmer families in India (subject to exclusion criteria).",
    benefit: "₹6,000 per year in three equal installments of ₹2,000, transferred directly to bank accounts.",
    howToApply:
      "Register on the official PM-KISAN portal with Aadhaar, land records and bank details, or apply via your nearest CSC/Common Service Centre.",
    link: "https://pmkisan.gov.in/",
  },
  {
    slug: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "insurance",
    eligibility: "All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.",
    benefit:
      "Comprehensive crop insurance against yield loss due to natural calamities, pests and diseases. Premium capped at 2% (Kharif), 1.5% (Rabi), 5% (horticulture).",
    howToApply: "Enroll through your bank, CSC or the National Crop Insurance Portal within the cut-off dates for each season.",
    link: "https://pmfby.gov.in/",
  },
  {
    slug: "kcc",
    name: "Kisan Credit Card (KCC)",
    ministry: "RBI / Ministry of Agriculture",
    category: "credit",
    eligibility: "All farmers (individual/joint), tenant farmers, oral lessees and SHGs of farmers.",
    benefit:
      "Short-term crop loans up to ₹3 lakh at 7% interest with 3% prompt repayment incentive (effective 4%). Also covers post-harvest, allied activities and consumption needs.",
    howToApply: "Apply through any commercial bank, RRB or cooperative bank with land documents and identity proof.",
    link: "https://www.myscheme.gov.in/schemes/kcc",
  },
  {
    slug: "pmksy",
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    ministry: "Ministry of Jal Shakti / Agriculture",
    category: "irrigation",
    eligibility: "Farmers and farmer groups seeking micro-irrigation, watershed development or expanded coverage.",
    benefit:
      "Subsidy on drip and sprinkler systems — up to 55% for small/marginal farmers and 45% for others. 'Har Khet Ko Pani' expands assured irrigation.",
    howToApply: "Apply through your state agriculture/horticulture department or the PMKSY portal.",
    link: "https://pmksy.gov.in/",
  },
  {
    slug: "e-nam",
    name: "e-NAM (National Agriculture Market)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "market",
    eligibility: "All farmers, FPOs and traders wanting transparent price discovery across mandis.",
    benefit: "Online trading platform linking 1000+ mandis, better prices, assaying and inter-mandi trade.",
    howToApply: "Register at enam.gov.in with mobile, Aadhaar and bank details or via your local APMC mandi.",
    link: "https://enam.gov.in/",
  },
  {
    slug: "shc",
    name: "Soil Health Card Scheme",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "soil",
    eligibility: "All farmers across India.",
    benefit:
      "Free soil testing every 2 years and a card with crop-wise recommended dosage of nutrients and fertilizers.",
    howToApply: "Contact your local Krishi Vigyan Kendra (KVK) or state agriculture department for soil sampling.",
    link: "https://soilhealth.dac.gov.in/",
  },
  {
    slug: "pkvy",
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "organic",
    eligibility: "Farmer groups/clusters of 50 farmers covering ~50 acres willing to adopt organic farming.",
    benefit:
      "₹50,000 per hectare over 3 years for organic inputs, certification, and value addition. PGS-India certification support.",
    howToApply: "Form a cluster and apply through the state agriculture department or nodal officer.",
    link: "https://pgsindia-ncof.gov.in/",
  },
  {
    slug: "pm-kmy",
    name: "PM Kisan Maandhan Yojana",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "income",
    eligibility: "Small and marginal farmers aged 18-40 years with cultivable land up to 2 hectares.",
    benefit: "₹3,000 monthly pension after age 60. Government matches farmer's monthly contribution (₹55–₹200).",
    howToApply: "Enroll at the nearest Common Service Centre (CSC) with Aadhaar and bank details.",
    link: "https://maandhan.in/",
  },
];
