import validator from "validator";

export function validPassword(password: string) {
  if (password.length < 8) {
    return false;
  }

  let num = false;
  let letter = false;
  for (const i of password) {
    if (validator.isAlpha(i)) {
      letter = true;
    }
    if (validator.isNumeric(i)) {
      num = true;
    }
  }
  if (!(num && letter)) {
    return false;
  }
  return true;
}
