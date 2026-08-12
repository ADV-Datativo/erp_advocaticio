// modules/usuarios/usuarios.state.js
// Estado local do submódulo — nunca fez parte de `store` global no
// original (sempre buscado fresco a cada render, sem cache
// persistente). Mantido aqui só pra estrutura consistente com os
// demais submódulos, não porque o comportamento original precisava.

let usuarios = [];
let convites = [];

export function definirUsuarios(lista) { usuarios = lista; }
export function listarUsuarios() { return usuarios; }
export function definirConvites(lista) { convites = lista; }
export function listarConvites() { return convites; }
