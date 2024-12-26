use std::process::Command;

pub fn read(path: &str) -> Result<String, ()> {
    if let Ok(output) = Command::new("dconf").args(["read", path]).output() {
        Ok(String::from_utf8_lossy(&output.stdout)
            .to_string()
            .replace('\'', "")
            .replace('"', "")
            .replace('\n', ""))
    } else {
        Err(())
    }
}
