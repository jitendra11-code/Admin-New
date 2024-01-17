
const blockInvalidChar = (e) => {
  console.log("blockinvalidchar",["e", "E", "+", "-", " "].includes(e.key));
  ["e", "E", "+", "-", " "].includes(e.key) && e.preventDefault();
};
export default blockInvalidChar;
