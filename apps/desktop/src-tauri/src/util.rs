use std::{fs, io, path};

use normalize_path::NormalizePath;

pub trait PathUtil {
    fn safe_join<P: AsRef<path::Path>>(&self, path: P) -> io::Result<path::PathBuf>;
    fn gen_unique_filename(&mut self) -> io::Result<path::PathBuf>;
}
impl PathUtil for path::Path {
    fn safe_join<P: AsRef<path::Path>>(&self, path: P) -> io::Result<path::PathBuf> {
        let normalize_path = match path.as_ref().try_normalize() {
            Some(path) if path.file_name().is_some() => path,
            _ => {
                return Err(io::Error::new(
                    io::ErrorKind::Other,
                    "Don't have access to this path",
                ))
            }
        };

        Ok(self.join(normalize_path))
    }

    fn gen_unique_filename(&mut self) -> io::Result<path::PathBuf> {
        let mut path = self.to_path_buf();
        let base_dir = match self.parent() {
            Some(value) => value,
            None => return Ok(path),
        };
        let file_name = match self.file_stem().and_then(|val| val.to_str()) {
            Some(value) => value.to_owned(),
            None => return Ok(path),
        };
        let file_ext = match self.extension().and_then(|val| val.to_str()) {
            Some(ext) => format!(".{ext}"),
            None => String::from(""),
        };

        let mut file_num = 0;
        let mut temp_file_name = format!("{}{}", file_name, file_ext);

        while fs::exists(base_dir.join(&temp_file_name))? {
            file_num += 1;
            temp_file_name = format!("{} {}{}", file_name, file_num, file_ext);
        }

        path.set_file_name(temp_file_name);

        Ok(path)
    }
}
