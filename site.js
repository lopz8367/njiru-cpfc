"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const mainNavigation = document.querySelector(".main-nav");

if (menuToggle && mainNavigation) {
	menuToggle.addEventListener("click", () => {
		const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
		menuToggle.setAttribute("aria-expanded", String(!isOpen));
		mainNavigation.classList.toggle("is-open", !isOpen);
	});

	mainNavigation.addEventListener("click", (event) => {
		if (event.target.closest("a")) {
			menuToggle.setAttribute("aria-expanded", "false");
			mainNavigation.classList.remove("is-open");
		}
	});
}

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12 });

	document.querySelectorAll(".info-card, .image-card, .update-card, .impact-story-card, .mini-card, .involvement-panel, .impact-examples article, .featured-story, .milestone-list li, .gallery-card, .story-section, .values-band, .callout-band, .contact-form").forEach((element) => {
		element.classList.add("reveal");
		revealObserver.observe(element);
	});
}

document.querySelectorAll("[data-gallery-filter]").forEach((button) => {
	button.addEventListener("click", () => {
		const category = button.dataset.galleryFilter;
		document.querySelectorAll("[data-gallery-filter]").forEach((filterButton) => {
			const isActive = filterButton === button;
			filterButton.classList.toggle("is-active", isActive);
			filterButton.setAttribute("aria-pressed", String(isActive));
		});
		document.querySelectorAll("[data-lightbox][data-category]").forEach((photo) => {
			photo.hidden = category !== "all" && photo.dataset.category !== category;
		});
	});
});

const lightbox = document.querySelector(".lightbox-dialog");
if (lightbox instanceof HTMLDialogElement) {
	const lightboxImage = lightbox.querySelector("img");
	const lightboxCaption = lightbox.querySelector("p");

	document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
		trigger.addEventListener("click", () => {
			const image = trigger.querySelector("img");
			if (!image || !lightboxImage || !lightboxCaption) {
				return;
			}

			lightboxImage.src = image.src;
			lightboxImage.alt = image.alt;
			lightboxCaption.textContent = trigger.dataset.title || image.alt;
			lightbox.showModal();
		});
	});

	lightbox.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox.close());
	lightbox.addEventListener("click", (event) => {
		if (event.target === lightbox) {
			lightbox.close();
		}
	});
}

const donationSelection = document.querySelector(".donation-selection");
if (donationSelection) {
	let frequency = document.querySelector("[data-frequency].is-selected")?.dataset.frequency || "One-time";
	let amount = document.querySelector("[data-amount].is-selected")?.dataset.amount || "500";
	const donationLink = document.querySelector("[data-donation-link]");

	const updateDonationSelection = () => {
		donationSelection.textContent = `Selected: ${frequency.toLowerCase()} gift of KES ${Number(amount).toLocaleString("en-KE")}`;
		if (donationLink instanceof HTMLAnchorElement) {
			const query = new URLSearchParams({ topic: "Donation enquiry", frequency, amount });
			donationLink.href = `contactus.html?${query.toString()}`;
		}
	};

	document.querySelectorAll("[data-frequency]").forEach((button) => {
		button.addEventListener("click", () => {
			frequency = button.dataset.frequency || frequency;
			document.querySelectorAll("[data-frequency]").forEach((option) => {
				const selected = option === button;
				option.classList.toggle("is-selected", selected);
				option.setAttribute("aria-pressed", String(selected));
			});
			updateDonationSelection();
		});
	});

	document.querySelectorAll("[data-amount]").forEach((button) => {
		button.addEventListener("click", () => {
			amount = button.dataset.amount || amount;
			document.querySelectorAll("[data-amount]").forEach((option) => {
				const selected = option === button;
				option.classList.toggle("is-selected", selected);
				option.setAttribute("aria-pressed", String(selected));
			});
			updateDonationSelection();
		});
	});

	updateDonationSelection();
}

const contactTopic = document.querySelector("#contact-topic");
const contactParameters = new URLSearchParams(window.location.search);
const requestedTopic = contactParameters.get("topic");
if (contactTopic instanceof HTMLSelectElement && requestedTopic) {
	const matchingOption = Array.from(contactTopic.options).find((option) => option.value === requestedTopic || option.textContent === requestedTopic);
	if (matchingOption) {
		contactTopic.value = matchingOption.value;
	}
}
const contactMessage = document.querySelector("#contact-message");
const donationAmount = contactParameters.get("amount");
const donationFrequency = contactParameters.get("frequency");
if (contactMessage instanceof HTMLTextAreaElement && ["500", "1500", "3000"].includes(donationAmount) && ["One-time", "Monthly"].includes(donationFrequency)) {
	contactMessage.value = `I am interested in a ${donationFrequency.toLowerCase()} gift of KES ${Number(donationAmount).toLocaleString("en-KE")}. Please share your verified donation instructions.`;
}

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
	const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
	const status = carousel.querySelector(".carousel-status");
	const pauseButton = carousel.querySelector("[data-carousel-pause]");
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	if (slides.length < 2 || !status || !pauseButton) {
		return;
	}

	let activeIndex = 0;
	let timerId;
	let paused = reducedMotion.matches;

	const showSlide = (index) => {
		activeIndex = (index + slides.length) % slides.length;
		slides.forEach((slide, slideIndex) => {
			const isActive = slideIndex === activeIndex;
			slide.hidden = !isActive;
			slide.setAttribute("aria-hidden", String(!isActive));
		});
		status.textContent = `${activeIndex + 1} / ${slides.length}`;
	};

	const stopRotation = () => {
		window.clearInterval(timerId);
		timerId = undefined;
	};

	const startRotation = () => {
		stopRotation();
		if (!paused && !document.hidden && !carousel.matches(":hover") && !carousel.contains(document.activeElement)) {
			timerId = window.setInterval(() => showSlide(activeIndex + 1), 5000);
		}
	};

	carousel.querySelector("[data-carousel-previous]")?.addEventListener("click", () => {
		showSlide(activeIndex - 1);
		startRotation();
	});

	carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => {
		showSlide(activeIndex + 1);
		startRotation();
	});

	pauseButton.addEventListener("click", () => {
		paused = !paused;
		pauseButton.textContent = paused ? "Play" : "Pause";
		pauseButton.setAttribute("aria-label", paused ? "Resume automatic photo changes" : "Pause automatic photo changes");
		startRotation();
	});

	carousel.addEventListener("mouseenter", stopRotation);
	carousel.addEventListener("mouseleave", startRotation);
	carousel.addEventListener("focusin", stopRotation);
	carousel.addEventListener("focusout", (event) => {
		if (!carousel.contains(event.relatedTarget)) {
			startRotation();
		}
	});
	document.addEventListener("visibilitychange", startRotation);
	reducedMotion.addEventListener("change", (event) => {
		paused = event.matches;
		pauseButton.textContent = paused ? "Play" : "Pause";
		pauseButton.setAttribute("aria-label", paused ? "Resume automatic photo changes" : "Pause automatic photo changes");
		startRotation();
	});

	showSlide(activeIndex);
	startRotation();
});

document.querySelectorAll("[data-mailto-form]").forEach((form) => {
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const recipient = form.dataset.recipient;
		const status = form.querySelector(".form-status");

		if (!recipient || !status) {
			if (status) {
				status.textContent = "This enquiry form is unavailable. Please email cpfcenter@gmail.com directly.";
			}
			return;
		}

		const data = new FormData(form);
		const subject = data.get("topic") || "Website enquiry";
		const body = [
			`Name: ${data.get("name")}`,
			`Email: ${data.get("email")}`,
			`Topic: ${subject}`,
			"",
			"Message:",
			data.get("message")
		].join("\n");

		status.textContent = "Your email app should open with this enquiry ready to review. The message is not sent until you choose to send it.";
		window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(String(subject))}&body=${encodeURIComponent(body)}`;
	});
});
