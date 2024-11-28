import { invoke } from "@tauri-apps/api/core";

export async function show_snap_overlay() {
	await invoke("plugin:decorum|show_snap_overlay");
}
