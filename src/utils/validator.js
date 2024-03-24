const validateEmail = (email) => {
  const re = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
  return re.test(email);
};

const validatePassword = (password) => {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$£!?%*#&!@#\$%&*\/\\?\(\)\{\}\[\]\|`¬¦ "^'<>:;~_\-+=,.])[A-Za-z\d@$£!?%*#&!@#\$%&*\/\\?\(\)\{\}\[\]\|`¬¦ "^'<>:;~_\-+=,.]{6,}$/;
  return re.test(password);
};

module.exports = {
  validateEmail,
  validatePassword,
};
