import fs from "node:fs/promises";
import path from "path";


const templatesCache = new Map<string, string>();

/**
 * Carica e cache un template html, sostituendo i placeholder con i valori forniti
 */
export async function loadTemplate<T extends BaseTemplate>(
	values: T,
	tmpPath: string
): Promise<string> {

	let template = templatesCache.get(tmpPath);
	if (!template) {
		const templatePath = path.resolve(process.cwd(), tmpPath);
		template = await fs.readFile(templatePath, "utf-8");
		templatesCache.set(tmpPath, template);
	}

	if (!values.logo_url) values.logo_url = `${process.env.FRONTEND_URL}/public/puce_logo.png`
	if (!values.action_label) values.action_label = "VIEW FEATURE"
	if (!values.support) values.support = "support@puce.app"

	// Replace all {{var}} placeholders in the template
	return template.replace(/{{(\w+)}}/g, (_, key) => values[key] || "");

}

type BaseTemplate = {
	logo_url?: string,
	action_label?: string,
	support?: string,
}

/** i dati da passare per un template ci verifica email by code */
export type CodeTemplate = {
	code: string,
} & BaseTemplate;

/**i dati da passare per un template di notifica */
export type NotificationTemplate = {
	title?: string,
	message?: string,
	action_url?: string,
	old_status?: string,
	new_status?: string,
} & BaseTemplate;