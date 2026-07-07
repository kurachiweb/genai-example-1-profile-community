// URL パラメータの版番号を検証する(terms/[version]・privacy/[version] で共通利用)。
export function parsePolicyVersionParam(raw: string): number | null {
	if (!/^\d+$/.test(raw)) return null;
	return Number(raw);
}
