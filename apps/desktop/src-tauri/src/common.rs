use std::{fs, io, path::{self, PathBuf}};

use normalize_path::NormalizePath;

pub fn stringify<T: ToString>(x: T) -> String {
    x.to_string()
}

pub fn ensure_dir<P: AsRef<path::Path>>(path: &P) -> io::Result<()> {
    if let false = fs::exists(path)? {
        fs::create_dir(path)?;
    };

    Ok(())
}

pub fn gen_unique_filename<'a>(
    base_path: &path::PathBuf,
    file_path: &'a mut path::PathBuf,
) -> io::Result<&'a path::PathBuf> {
    let file_name = match file_path.file_stem().and_then(|val| val.to_str()) {
        Some(value) => value.to_owned(),
        None => return Ok(file_path),
    };
    let file_ext = match file_path.extension().and_then(|val| val.to_str()) {
        Some(ext) => format!(".{ext}"),
        None => String::from(""),
    };

    let mut file_num = 0;
    while fs::exists(base_path.join(&file_path))? {
        file_num += 1;
        file_path.set_file_name(format!("{} {}{}", file_name, file_num, file_ext));
    }

    Ok(file_path)
}
