use enigo::{Enigo, InputResult, Keyboard};

pub fn press_paste(enigo: &mut Enigo) -> InputResult<()> {
  #[cfg(target_os = "windows")]
  enigo.key(enigo::Key::Control, enigo::Direction::Press)?;
  
  #[cfg(target_os = "macos")]
  enigo.key(enigo::Key::Command, enigo::Direction::Press)?;
  
  enigo.key(enigo::Key::V, enigo::Direction::Press)?;
  
  #[cfg(target_os = "windows")]
  enigo.key(enigo::Key::Control, enigo::Direction::Release)?;
  
  #[cfg(target_os = "macos")]
  enigo.key(enigo::Key::Command, enigo::Direction::Release)?;

  enigo.key(enigo::Key::V, enigo::Direction::Release)?;

  Ok(())
}