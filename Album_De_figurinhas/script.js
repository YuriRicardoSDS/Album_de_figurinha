function mostrarTexto(card) {
	let texto = card.querySelector(".overlay-text");
	if (texto.style.opacity === "1") {
		texto.style.opacity = "0";
	} else {
		texto.style.opacity = "1";
	}
}