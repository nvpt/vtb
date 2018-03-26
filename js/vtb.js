/**
 * Created by Evgeniy on 31.05.2017.
 */
$(document).ready(function () {

    /**
     * Параметры карусели
     */
    $(".owl-carousel").owlCarousel({
        items: 1,//*
        loop: true,//*
        center: true,//*
        rewind: false,

        smartSpeed: 250,
        dragEndSpeed: false,
        fluidSpeed: false,
        autoplaySpeed: 2650,//*
        autoplay: true,//*
        autoplayTimeout: 8000,//*
        autoplayHoverPause: true,//*

        mouseDrag: true,
        touchDrag: true,
        pullDrag: true,
        freeDrag: false,

        margin: 84,//*
        stagePadding: 0,

        merge: false,
        mergeFit: true,
        autoWidth: true,//*

        startPosition: 0,
        rtl: false,

        responsiveRefreshRate: 200,
        responsiveBaseElement: window,

        fallbackEasing: 'swing',
        info: false,

        nestedItemSelector: false,
        itemElement: 'div',
        stageElement: 'div',

        refreshClass: 'owl-refresh',
        loadedClass: 'owl-loaded',
        loadingClass: 'owl-loading',
        rtlClass: 'owl-rtl',
        responsiveClass: 'owl-responsive',
        dragClass: 'owl-drag',
        itemClass: 'owl-item',
        stageClass: 'owl-stage',
        stageOuterClass: 'owl-stage-outer',
        grabClass: 'owl-grab',

        nav: true,
        navText: ['prev', 'next'],
        navSpeed: false,
        navElement: 'div',
        navContainer: '#customNav',
        navContainerClass: 'owl-nav',
        navClass: ['owl-prev', 'owl-next'],
        slideBy: 1,//*
        dotClass: 'owl-dot',
        dotsClass: 'owl-dots',
        dots: true,
        dotsEach: false,
        dotsData: false,
        dotsSpeed: false,
        dotsContainer: false,

        responsive: {//*
            650: {
                items: 3,
                slideBy: 3
            }
        }
    });


    /**
     * Маска для инпута. Maskedinput
     */
    $('#cardNumber').mask('9999', {placeholder: "____"});


    /**
     * Плавный скролл к якорю
     */
    $(document).on('click', '#toKnow', function (event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: $($.attr(this, 'href')).offset().top}, 1000);
    });


    /**
     * Scroll top
     */
    function showScrollTop() {
        if ($(document).scrollTop() > 500) {
            $('#scrollTop').fadeIn(150).css('display', 'block');
        } else {
            $('#scrollTop').fadeOut(150);
        }
    }

    (function activateScroll() {
        $('#scrollTop').on('click', function (e) {
            e.preventDefault();
            var scrollTime;
            if ($('body').scrollTop() === 0) {//ff
                scrollTime = $('html').scrollTop() / 7;
                console.log('test1');
            } else {//не  ff
                scrollTime = $('body').scrollTop() / 7;
                console.log('test2');
            }
            $('html,body').animate(
                {'scrollTop': 0}, scrollTime
            );
        });
    })();


    /**
     *Отслеживание высоты срабатывания действия
     * @param el - класс элемента, к которуому применяем действие
     * @param activeHeight - высота, снизу экрана, на которой применяется действие. Например 0.2 - значит сработает на 20% снизу от экрана.
     * По умолчанию = 0.1
     * @returns {boolean}
     */
    function checkHeight(el, activeHeight) {
        var activeHeightValue = parseFloat(activeHeight) || 0.1;//need height-action of screen from bottom;
        var element = document.querySelector('.' + el);
        if (element) {
            var distanceToTop = element.getBoundingClientRect().top;//расстрояние элемента до верха экрана
            var screenHeight = window.innerHeight//высота экрана
                || document.documentElement.clientHeight
                || document.body.clientHeight;
        }
        return parseFloat(distanceToTop) < (screenHeight * (1 - activeHeightValue));
    }


    /**
     * Анимация path-линий
     * @param pathClass - класс path элемента в кавычках без точки
     * @param heightAction - высота срабатывания снизу о экрана. См. checkHeight
     */
    function pathAnimate(pathClass, heightAction) {
        var path = document.querySelector('.' + pathClass + '.active');

        if (path) {
            var length = path.getTotalLength();

            if (checkHeight(pathClass, heightAction)) {
                path.style.transition = path.style.WebkitTransition = 'none';
                path.style.strokeDasharray = (length * 10 + ' ' + length * 10);// умножаем на 10 , т.к. в патах используем vector-effect="non-scaling-stroke"
                path.style.strokeDashoffset = (length * 10);
                path.style.opacity = "0.9";
                path.getBoundingClientRect();
                path.style.transition = path.style.WebkitTransition =
                    'stroke-dashoffset 1s ease-in';
                setTimeout(function () {
                    path.style.strokeDasharray = 1 + ' ' + 12;
                }, 500);
                path.style.strokeDashoffset = '0';
                path.classList.remove('active');
            }
        }
    }


    /**
     * Анимация элементов посредством добавления класса анимации. В частности используется библиотека animate.css
     * @param targetClass - класс отслеживаемого элемента в кавычках без точки
     * @param classAnimation - класс, описывающий анимацию, добавляем после прокрутки до высоты срабатывания анимации. String
     * @param activeHeight - высота срабатывания анимации. По умолчанию 0.1 от высоты экрана. Float
     * @param invisible - если true, то элемент невидим перед началом анимации. При этом элементу ОБЯЗАТЕЛЬНО прописывать инлайном класс invisible. Boolean
     * @param changedClass - класс элемента, которому приписывается анимация. Если не указан, то это класс элемента отслеживания (первый параметр). String
     * @param toggle
     */
    function animateElementsByHeight(targetClass, classAnimation, activeHeight, invisible, changedClass, toggle) {

        var invisibleValue = invisible || false;//скрытие отображение элемента перед началом анимации

        if ((changedClass !== undefined) && (changedClass !== '')) {
            var changed = document.querySelector('.' + changedClass);
        } else {
            changed = document.querySelector('.' + targetClass);
        }

        if (checkHeight(targetClass, activeHeight)) {
            changed.classList.add(classAnimation);
            invisibleValue ? changed.classList.remove('invisible') : '';
        } else {
            if (toggle === true) { //повторение/неповторение анимации
                changed.classList.remove(classAnimation);
                invisibleValue ? changed.classList.add('invisible') : '';
            }
        }
    }


    /**
     * Фиксирование скролла анимации для блока appeal
     */
    function appealHideAnimation() {
        var appeal = document.querySelector('.appeal');
        var appealText = document.querySelector('.appeal__hidden-content');

        if ($(appeal).scrollTop() === $(appeal).height()) {
            appeal.classList.remove('appeal-js');
            appealText.style.display = 'block';
            appealText.style.height = '100%';
        }
    }


    /*
    * firefox не понимает передачи стилями параметров атрибутов 'd' и 'r'.
    * Поэтому меняем скриптом через отслеживание ресайза
    */
    function setPathFirefox() {
        var screenWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        if (screenWidth < 992) {
            document.querySelector('.main-list__dots-path_1').setAttribute('d', 'M 50 1 L 50 99');
            document.querySelector('.main-list__dots-path_2').setAttribute('d', 'M 50 1 L 50 99');
            document.querySelector('.main-list__dots-path_3').setAttribute('d', 'M 50 1 L 50 99');
            document.querySelector('.main-list__dots-path_4').setAttribute('d', 'M 50 1 L 50 99');
            document.querySelector('.footer-form__dots-path').setAttribute('d', 'M 50 1 L 50 99');
        } else {
            document.querySelector('.main-list__dots-path_1').setAttribute('d', 'M 1 1 L 1 99');
            document.querySelector('.main-list__dots-path_2').setAttribute('d', 'M 1 1 L 1 99');
            document.querySelector('.main-list__dots-path_3').setAttribute('d', 'M 1 1 L 1 99');
            document.querySelector('.main-list__dots-path_4').setAttribute('d', 'M 1 1 L 1 99');
            document.querySelector('.footer-form__dots-path').setAttribute('d', 'M1 50  L99 50');
        }
    }

    setPathFirefox();

    window.addEventListener('resize', function () {
        setPathFirefox();
    });


    pathAnimate('header__dots-path', 0.1);
    window.addEventListener('scroll', function () {
        showScrollTop();
        appealHideAnimation();

        animateElementsByHeight('potential__top-animate', 'fadeInLeft', 0.1, true);
        animateElementsByHeight('potential__description_top', 'fadeInUp', 0.1, true);
        animateElementsByHeight('potential__description_small', 'fadeInUp', 0.1, true);
        animateElementsByHeight('ecosystem__animation_top', 'fadeInLeft', 0.1, true);
        animateElementsByHeight('main-list__item_1-js', 'fadeInLeft', 0.3, true);
        animateElementsByHeight('main-list__item_2-js', 'fadeInLeft', 0.3, true);
        animateElementsByHeight('main-list__item_3-js', 'fadeInLeft', 0.3, true);
        animateElementsByHeight('partners__title', 'fadeInLeft', 0.3, true);
        animateElementsByHeight('partners__partners-all', 'fadeInRight', 0.3, true);
        animateElementsByHeight('partners__carousel', 'fadeInUp', 0.3, true);
        animateElementsByHeight('footer__card-pin', 'active', 0.3, '', '');

        pathAnimate('potential__dots-path', 0.4);
        pathAnimate('potential__bottom-dots-path', 0.4);
        pathAnimate('main-list__dots-path_1', 0.4);
        pathAnimate('main-list__dots-path_2', 0.4);
        pathAnimate('main-list__dots-path_3', 0.4);
        pathAnimate('main-list__dots-path_4', 0.4);
        pathAnimate('footer__dots-path', 0.7);
        pathAnimate('footer-form__dots-path', 0.2);
    });
});
