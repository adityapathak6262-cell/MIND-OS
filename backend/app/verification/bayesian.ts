/**
 * MIND-OS Bayesian Evidence Verification Engine
 * Updates diagnostic beliefs using transparent likelihood updates over targeted follow-up evidence.
 */

export interface GapProbabilities {
  C1: number; // Conceptual
  C2: number; // Logical Reasoning
  C3: number; // Procedural
  C4: number; // Misconception
  C5: number; // Knowledge Recall
}

export interface BayesianUpdateStep {
  category: keyof GapProbabilities;
  prior: number;
  likelihood: number;
  unnormalized_posterior: number;
  normalized_posterior: number;
}

export interface VerificationResult {
  previous_probabilities: GapProbabilities;
  updated_probabilities: GapProbabilities;
  primary_gap: keyof GapProbabilities;
  secondary_gaps: (keyof GapProbabilities)[];
  verification_status: "UNVERIFIED" | "PROVISIONALLY_SUPPORTED" | "SUFFICIENTLY_SUPPORTED";
  confidence_delta: number;
  entropy: number;
  bayesian_steps: BayesianUpdateStep[];
  explanation: string;
}

export function computeShannonEntropy(probs: GapProbabilities): number {
  const values = Object.values(probs);
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum === 0) return 2.32;
  return -values.reduce((acc, p) => {
    const norm = p / sum;
    return norm > 0 ? acc + norm * Math.log2(norm) : acc;
  }, 0);
}

export function updateBeliefWithEvidence(
  priors: GapProbabilities,
  favored_category: keyof GapProbabilities,
  likelihood_ratio: number = 4.0
): VerificationResult {
  const categories: (keyof GapProbabilities)[] = ["C1", "C2", "C3", "C4", "C5"];
  
  // Model likelihoods: favored category gets likelihood L, others get base likelihood 1.0 (with slight variance based on similarity)
  const likelihoods: Record<keyof GapProbabilities, number> = {
    C1: favored_category === "C1" ? likelihood_ratio : (favored_category === "C4" ? 1.5 : 0.8),
    C2: favored_category === "C2" ? likelihood_ratio : 0.7,
    C3: favored_category === "C3" ? likelihood_ratio : 0.8,
    C4: favored_category === "C4" ? likelihood_ratio : (favored_category === "C1" ? 1.4 : 0.7),
    C5: favored_category === "C5" ? likelihood_ratio : 0.7
  };

  const steps: BayesianUpdateStep[] = [];
  let normalizer = 0;

  for (const cat of categories) {
    const prior = priors[cat];
    const lik = likelihoods[cat];
    const unnorm = prior * lik;
    normalizer += unnorm;
    steps.push({
      category: cat,
      prior: Math.round(prior * 1000) / 1000,
      likelihood: Math.round(lik * 1000) / 1000,
      unnormalized_posterior: Math.round(unnorm * 1000) / 1000,
      normalized_posterior: 0
    });
  }

  const updated: GapProbabilities = { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0 };
  for (const s of steps) {
    const post = Math.min(0.96, Math.max(0.02, s.unnormalized_posterior / (normalizer || 1)));
    s.normalized_posterior = Math.round(post * 1000) / 1000;
    updated[s.category] = s.normalized_posterior;
  }

  // Sort updated categories
  const sorted = [...categories].sort((a, b) => updated[b] - updated[a]);
  const primary = sorted[0];
  const secondary = sorted.slice(1).filter((c) => updated[c] >= 0.35);

  const entropy = Math.round(computeShannonEntropy(updated) * 100) / 100;
  const confidence_delta = Math.round((updated[primary] - priors[primary]) * 1000) / 1000;

  let verification_status: "UNVERIFIED" | "PROVISIONALLY_SUPPORTED" | "SUFFICIENTLY_SUPPORTED" = "UNVERIFIED";
  if (updated[primary] >= 0.78 && entropy < 1.7) {
    verification_status = "SUFFICIENTLY_SUPPORTED";
  } else if (updated[primary] >= 0.55) {
    verification_status = "PROVISIONALLY_SUPPORTED";
  }

  const explanation = `Follow-up evidence increased posterior probability of ${primary} from ${(priors[primary] * 100).toFixed(0)}% to ${(updated[primary] * 100).toFixed(0)}% (likelihood ratio: ${likelihood_ratio.toFixed(1)}x, entropy: ${entropy}).`;

  return {
    previous_probabilities: priors,
    updated_probabilities: updated,
    primary_gap: primary,
    secondary_gaps: secondary,
    verification_status,
    confidence_delta,
    entropy,
    bayesian_steps: steps,
    explanation
  };
}
