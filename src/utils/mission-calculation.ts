/**
 * missionRolls.ts
 *
 * Implements the probability outcome system from the Desmos calculator,
 * with thresholds aligned exactly to Desmos rounding and intervals.
 *
 * ----------------------------
 * Outcome categories:
 * ----------------------------
 * - 0 → fD       : Failure Requiring Intervention
 * - fD+1 → fC    : Failure
 * - fC+1 → fB    : Mixed Outcome
 * - fB+1 → fA    : Success
 * - fA+1 → 100   : Critical Success
 */

export interface MissionCalculationInputs {
	LM: number; // Mission Level
	NM: number; // Number of people called for by mission
	Np: number; // Number of people in party
	Lp: number; // Average Party Level
	Pp: number; // Number of people matching ideal comp
	R: number; // Reputation
	O: number; // Ad-hoc/extenuating
}

export interface Factors {
	a: number;
	aL: number;
	aP: number;
	aN: number;
	aR: number;
	aO: number;
	biasB?: number; // optional boost to fB
	biasC?: number; // optional boost to fC
}

export const defaultFactors: Factors = {
	a: 2.0, // overall strength factor
	aL: 1.0, // mission level factor
	aP: 1.0, // propriety factor
	aN: 0.8, // party members factor
	aR: 0.8, // reputation factor
	aO: 1.1, // ad-hoc factor
	biasB: 10, // boost fB by 2
	biasC: 5, // boost fC by 1
};

// Round like Desmos (nearest integer)
function desmosRound(x: number): number {
	return Math.floor(x + 0.5);
}

const boundaryParams = {
	A: { k: 0.5, off: -1.1 }, // Critical Success
	B: { k: 1.0, off: 0.1 }, // Success
	C: { k: 1.0, off: 0.35 }, // Mixed Outcome
	D: { k: 1.0, off: 1.0 }, // Failure (note: fixed offset = 1.0)
};

export function getMissionThresholds(inputs: MissionCalculationInputs, factors: Factors = defaultFactors) {
	const { LM, NM, Np, Lp, Pp, R, O } = inputs;
	const { a, aL, aP, aN, aR, aO } = factors;

	// Mission metric
	const term =
		(5 / 4) *
		Math.pow(Lp / LM, aL) *
		Math.pow(Pp / NM, aP) *
		Math.pow(Np / NM, aN) *
		Math.pow(1 + R / 100, aR) *
		Math.pow(1 + O / 100, aO);

	const m = a * Math.log(term);

	function boundary(k: number, offset: number) {
		const raw = 50 * (1 - Math.tanh(k * m + offset));
		return desmosRound(raw);
	}

	let fA = boundary(boundaryParams.A.k, boundaryParams.A.off);
	let fB = boundary(boundaryParams.B.k, boundaryParams.B.off) + (factors.biasB ?? 0);
	let fC = boundary(boundaryParams.C.k, boundaryParams.C.off) + (factors.biasC ?? 0);
	let fD = boundary(boundaryParams.D.k, boundaryParams.D.off);

	console.log('getMissionThresholds', { inputs, factors, m, fA, fB, fC, fD });

	// Safety net: enforce monotonic ordering
	if (fD >= fC) fD = Math.max(0, fC - 1);
	if (fC >= fB) fC = Math.max(0, fB - 1);
	if (fB >= fA) fB = Math.max(0, fA - 1);

	return { fA, fB, fC, fD, m };
}

// ----------------------------
// Evaluate Roll
// ----------------------------
export function evaluateMissionRoll(roll: number, inputs: MissionCalculationInputs, factors: Factors = defaultFactors) {
	const thresholds = getMissionThresholds(inputs, factors);
	const { fA, fB, fC, fD } = thresholds;

	let outcome: string;
	if (roll <= fD) outcome = 'Critical Failure';
	else if (roll <= fC) outcome = 'Failure';
	else if (roll <= fB) outcome = 'Mixed';
	else if (roll <= fA) outcome = 'Success';
	else outcome = 'Critical Success';

	console.log('evaluateMissionRoll', { roll, outcome, thresholds, inputs, factors });

	return { outcome, thresholds, m: thresholds.m };
}
