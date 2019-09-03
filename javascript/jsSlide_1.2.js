//https://blog.niap3d.com/jsSlide
function jsSlide(aData){
	// paramètres
	var me = this;				// objet
	me.id;						// identifiant du bloc à animer
	me.parentWidth;				// largeur du parent
	me.isPlaying = false;		// lecture en cours (true | false)
	me.isVisible = true;		// onglet visible (true | false)
	me.slideNb = 0;				// numéro de slider affiché
	me.slideMax = 0;			// nombre totale de slide
	me.intervalObj = 0;			// obj créer par SetInterval
	me.intervalTiming = 5000;	// pause en milliseconde utilisé par SetInterval
	me.sens = 1;				// sens d'animation : 1 animation vers la droite. -1 animation vers la gauche
	me.callBack = '';			// fonction de retour après une animation
	me.prefix = [''];			// liste des prefix CSS à utiliser
	me.prefixLength = 0;		// nombre de prefix (pour éviter de recalculer à chaque fois)

	// initialisation
	me.Init = function(aData){
		var e = document.getElementById(aData.id);
		if(e == null || !e.hasChildNodes()) return 0;
		// initialise la transition CSS
		if(aData.duration == null) aData.duration = 1000;
		if(aData.timingFunction == null) aData.timingFunction = 'linear';
		if(aData.delay == null) aData.delay = 0;
		// prefix
		if(aData.prefix != null){
			me.prefix = aData.prefix;
		}
		me.prefixLength = me.prefix.length;
		// ajoute la transition à l'élément
		me.ElementStyle(e.style, 'transition', 'all '+aData.duration+'ms '+aData.timingFunction+' '+aData.delay+'ms');
		// corrige le flash de safari
		e.style['-webkit-backface-visibility'] = 'hidden';
		// 
		if(aData.intervalTiming != null) me.intervalTiming = aData.intervalTiming;
		me.id = aData.id;
		me.callBack = aData.callBack;
		// bouton précédent
		e = document.getElementById(aData.buttonPrev);
		if(e != null) e.addEventListener('click', function(){
			me.MoveToLeft();
		}, false);
		// bouton suivant
		e = document.getElementById(aData.buttonNext);
		if(e != null) e.addEventListener('click', function(){
			me.MoveToRight();
		}, false);
		// bouton play
		e = document.getElementById(aData.buttonPlay);
		if(e != null) e.addEventListener('click', function(){
			me.Play(true);
		}, false);
		// bouton pause
		e = document.getElementById(aData.buttonStop);
		if(e != null) e.addEventListener('click', function(){
			me.Stop();
		}, false);
		// au redimensionnement, on replace et recalcule les éléments
		window.addEventListener('resize', function(){
			me.SlideResize();
		}, true);
		// verifie si l'onglet est actif
		document.addEventListener("visibilitychange", function(){
			me.VisibilityUpdate();
		});
		me.isVisible = document.hidden;
		// redimensionne les éléments
		me.SlideResize();
		// lecture auto
		if(aData.autoplay == true) me.Play(false);
	}

	// redimensionne les éléments
	me.SlideResize = function(){
		var e = document.getElementById(me.id), i, l, s;
		var eChild = e.childNodes;
		var eW = 0;
		me.slideMax = 0;
		// dimension du parent en pixel
		me.parentWidth = e.parentNode.clientWidth;
		for(i = 0, l = eChild.length; i < l; i++){
			// ne modifie que les nodes de type ELEMENT_NODE
			if(eChild[i].nodeType !== 1) continue;
			s = eChild[i].currentStyle || window.getComputedStyle(eChild[i]);
			// place l'élément
			eChild[i].style.float = 'left';
			// fixe la dimension = largeur du parent - margin - padding - border
			eChild[i].style.width = (me.parentWidth - parseFloat(s.marginLeft) - parseFloat(s.marginRight) - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight) - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth))+'px';
			eW += me.parentWidth;
			me.slideMax++;
		}
		// fixe la largeur de l'élément
		e.style.width = eW+'px';
		// replace l'animation sur l'élément visible
		me.SlideAnim();
	}

	me.VisibilityUpdate = function(){
		me.isVisible = document.hidden;
	}

	// lance l'animation
	me.Play = function(aStart){
		clearInterval(me.intervalObj);
		me.intervalObj = setInterval(function(){
			me.SlideAnimPrepare();
		}, me.intervalTiming);
		me.isPlaying = true;
		// lance l'animation sans attendre
		if(aStart) me.SlideAnimPrepare();
	}

	// stop l'animation
	me.Stop = function(){
		clearInterval(me.intervalObj);
		me.intervalObj = 0;
		me.isPlaying = false;
	}
	
	// prépare l'animation
	me.SlideAnimPrepare = function(){
		if(me.isVisible) return;
		// vérifie si le sens est bon
		if(me.sens == 1 && me.slideNb >= me.slideMax-1) me.sens = -1;
		else if(me.sens == -1 && me.slideNb <= 0) me.sens = 1;
		// modifie le numero de slide
		if(me.sens == 1) me.slideNb++;
		else me.slideNb--;
		// animation
		me.SlideAnim();
	}

	// lance l'animation css
	me.SlideAnim = function(){
		me.ElementStyle(document.getElementById(me.id).style, 'transform', 'translateX(-'+me.slideNb * me.parentWidth+'px)');
		if(typeof me.callBack === "function") me.callBack(aNb);
	}

	// déplace vers la gauche
	me.MoveToLeft = function(){
		if(me.slideNb <= 0) return 0;
		me.slideNb--;
		if(me.isPlaying) me.Play(false);
		me.SlideAnim();
		return 1;
	}

	// déplace vers la droite
	me.MoveToRight = function(){
		if(me.slideNb >= me.slideMax-1) return 0;
		me.slideNb++;
		if(me.isPlaying) me.Play(false);
		me.SlideAnim();
		return 1;
	}

	// déplace vers un numéro de slide
	me.MoveTo = function(aNb){
		if(aNb > me.slideMax-1 || aNb < 0) return 0;
		me.slideNb = aNb;
		if(me.isPlaying) me.Play(false);
		me.SlideAnim();
		return 1;
	}

	// affecte une valeur à une propriété css avec les prefix
	me.ElementStyle = function(aS, aProp, aValue){
		for(var i = 0; i < me.prefixLength; i++){
			aS[me.prefix[i]+aProp] = aValue;
		}
	}

	// initialise l'object
	me.Init(aData);
	return me;
}