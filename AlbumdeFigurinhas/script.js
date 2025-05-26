function mostrarTexto(elemento){
  const todos = document.querySelectorAll('.img-container');
  todos.forEach(el => el.classList.remove('selecionado'));
  elemento.classList.add('selecionado');
}
