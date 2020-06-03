class SYSlider {
    slideIndex;
    sliderItems;
    sliderContainer;
    controlItems;
    dotContainer;
    options;

    constructor(rootElement, slideIndex, options) {
        this.rootElement = rootElement;
        this.slideIndex = slideIndex;
        this.sliderItems = document.querySelectorAll(`${rootElement} .sy-slider__container-item`);
        this.sliderContainer = document.querySelector(`${rootElement} .sy-slider__container`);
        this.controlItems = document.querySelectorAll(`${rootElement} .sy-slider__control-item`);
        this.dotContainer = document.querySelector(`${rootElement} .sy-slider__dots`);
        this.options = options || {};

        this.initControlElements();

        this.renderSlider();
        if (options.autoPlay)
            this.runAutoPlay();

        if (!options.fade) {
            this.setupResizeListener();
        }
    }

    runAutoPlay() {
        let delay = this.options.delay || 3000;
        const changeSlide = () => {
            this.changeSlideIndex({controlIndex: 1})();
        };
        this.intervalId = setInterval(changeSlide, delay);

        const slider = document.querySelector(`${this.rootElement} .sy-slider`);
        slider.addEventListener('mouseenter', () => {
            clearInterval(this.intervalId);
        });
        slider.addEventListener('mouseleave', () => {
            this.intervalId = setInterval(changeSlide, delay);
        });
    }

    initControlElements() {
        const {sliderItems, controlItems} = this;
        for (let i = 0; i < controlItems.length; i++) {
            controlItems[i].addEventListener(
                'click',
                this.changeSlideIndex({controlIndex: i})
            );
        }

        for (let i = 0; i < sliderItems.length; i++) {
            this.renderDot(i);
        }
    }

    renderDot(index) {
        const dotItem = document.createElement('div');
        dotItem.classList.add('sy-slider__dots-item');
        dotItem.addEventListener(
            'click',
            this.changeSlideIndex({slideIndex: index})
        );
        this.dotContainer.append(dotItem);

    }

    getPositiveModule(number, module) {
        if (number >= 0)
            return number % module;

        return number % module + module;
    }

    setupResizeListener() {
        window.addEventListener('resize', () => {
            this.renderSlider();
        });
    }

    changeSlideIndex({controlIndex, slideIndex}) {
        return () => {
            if (slideIndex !== undefined) {
                this.slideIndex = slideIndex;
            } else {
                switch (controlIndex) {
                    case 0:
                        this.slideIndex--;
                        break;
                    case 1:
                        this.slideIndex++;
                        break;
                }
            }

            this.slideIndex = this.getPositiveModule(this.slideIndex, this.sliderItems.length);
            this.renderSlider();
        }
    }

    renderSlider() {
        const {
            sliderItems,
            slideIndex,
            dotContainer,
            options: { fade = true }
        } = this;

        if (fade) {
            for (const sliderItem of sliderItems) {
                sliderItem.style.opacity = '0';
            }
            sliderItems[slideIndex].style.opacity = '1';
        }
        else {
            const width = this.sliderContainer.clientWidth;
            this.sliderContainer.classList.add('fade-off');
            for (const sliderItem of sliderItems) {
                sliderItem.classList.add('fade-off');
            }
            this.sliderContainer.style.left = `-${width * slideIndex}px`;
        }

        const dotItems = dotContainer.children;
        for (const dotItem of dotItems) {
            dotItem.classList.remove('active')
        }

        dotItems[slideIndex].classList.add('active');
    }

}

export default SYSlider;