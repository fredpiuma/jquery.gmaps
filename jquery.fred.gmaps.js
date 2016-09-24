/**

___________                  .___           .__                   .___       _________                  __                 
\_   _____/______   ____   __| _/___________|__| ____  ____     __| _/____   \_   ___ \_____    _______/  |________  ____  
 |    __) \_  __ \_/ __ \ / __ |/ __ \_  __ \  |/ ___\/  _ \   / __ |/ __ \  /    \  \/\__  \  /  ___/\   __\_  __ \/  _ \ 
 |     \   |  | \/\  ___// /_/ \  ___/|  | \/  \  \__(  <_> ) / /_/ \  ___/  \     \____/ __ \_\___ \  |  |  |  | \(  <_> )
 \___  /   |__|    \___  >____ |\___  >__|  |__|\___  >____/  \____ |\___  >  \______  (____  /____  > |__|  |__|   \____/ 
     \/                \/     \/    \/              \/             \/    \/          \/     \/     \/                      

	Funções para o manuseio do Google Maps
	Copyright (c) 2011-2015 Frederico Marques de Castro (fredericodecastro.com.br)
	Free Licence
	Version: 1.8.1 (2016-09-23)
	Dependences: jquery, http://maps.googleapis.com/maps/api/js?v=3&sensor=false

	*/

	function gMaps(map_tag, latitude, longitude, map_options)
	{
		this.map = null;
		this.map_tag = map_tag;
		this.map_options = map_options;
		this.latitude = parseFloat(latitude);
		this.longitude = parseFloat(longitude);
		this.marcadores = [];
		this.circulos = [];

		/* classe para armazenar as informações do marcador */
		var _marker = function()
		{
			this.marker = null;
			this.infoWindow = null;
			this.options = null;
			this.hide = function(){ this.marker.setMap(null); }
			this.show = function(){ this.marker.setMap(this.options.map); }
		}

		/* classe para armazenar as informações dos circulos */
		var _circle = function()
		{
			this.circle = null;
			this.options = null;
			this.hide = function(){ this.circle.setMap(null); }
			this.show = function(){ this.circle.setMap(this.options.map); }
		}

		var defaults = {
			/* zoom do mapa */
			zoom: 12,
			/* possibilita dar zoom com o mouse */
			scrollwheel: true,
			/* centro do mapa */
			center: new google.maps.LatLng(latitude,longitude),
			/* se verdadeiro desativa as ferramentas do usuário */
			disableDefaultUI : false,
			/* outras opções de personalização das ferraentas do usuário */
			panControl: true,
			zoomControl: true,
			mapTypeControl: true,
			scaleControl: true,
			streetViewControl: true,
			overviewMapControl: true,
			pretoebranco : false,
			/* tipo do mapa */
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}

		/* funde as configurações passadas com as padrões */
		this.map_options = jQuery.extend(defaults, map_options);

		/* se for preto e branco define o style necessário */
		if(this.map_options.pretoebranco) this.map_options.styles = [{"stylers":[{"saturation":-100}]}];

		/* caso informado abreviado corrige o objeto */
		if(this.map_options.mapTypeId) switch(this.map_options.mapTypeId)
		{
			case 'ROADMAP':
			case 'roadmap':
			case 'estrada':
			case 'rua':
			this.map_options.mapTypeId = google.maps.MapTypeId.ROADMAP;		break;

			case 'HYBRID':
			case 'hybrid':
			case 'hibrido':
			case 'ambos':
			case 'both':
			this.map_options.mapTypeId = google.maps.MapTypeId.HYBRID;		break;

			case 'SATELLITE':
			case 'satellite':
			case 'satelite':
			this.map_options.mapTypeId = google.maps.MapTypeId.SATELLITE;	break;

			case 'TERRAIN':
			case 'terrain':
			case 'terreno':
			this.map_options.mapTypeId = google.maps.MapTypeId.TERRAIN;		break;
		}

		/* cria o mapa */
		this.map = new google.maps.Map(jQuery(this.map_tag)[0], this.map_options);

		/* adicionar marcadores */
		this.addMarker = function(options)
		{
			var marker = new _marker();

			var defaults = {
				parent : marker,
				title : '',
				latitude: this.latitude,
				longitude: this.longitude,
				map: this.map,
				html : '<div></div>',
				icon: 'http://www.google.com/mapfiles/marker.png',
				popup : false,
				onClick : function(){}
			}

			marker.options = jQuery.extend(defaults, options);

			/* forçanco formato das informações, é necessário que sejam float */
			/* as vezes podemos informar em string, isso evita problemas */
			marker.options.latitude = parseFloat(marker.options.latitude);
			marker.options.longitude = parseFloat(marker.options.longitude);

			marker.marker = new google.maps.Marker({
				position: new google.maps.LatLng(marker.options.latitude, marker.options.longitude),
				map: marker.options.map,
				title: marker.options.title,
				icon: marker.options.icon
			});

			/* cria a janela de informações se houver um html */
			if(marker.options.html)
			{
				marker.infoWindow = new google.maps.InfoWindow({
					content: marker.options.html
				});

				/* se estiver setado pra abrir o marcador automaticamente */
				if(marker.options.popup) marker.infoWindow.open(marker.options.map, marker.marker);
			}

		//adiciona um evento click para o marcador
		google.maps.event.addListener(marker.marker, 'click', function() {
			marker.options.onClick();
			if(marker.infoWindow) marker.infoWindow.open(marker.options.map, marker.marker);
		});
		
		/* guarda o marcador */
		this.marcadores.push(marker);
		
		/* retorna o marcador */
		return marker;
	}
	
	/* adicionar marcadores */
	this.addCircle = function(options)
	{
		var circle = new _circle();
		
		var defaults = {
			marker : this.marcadores[0].marker,
			map: this.map,
			radius: 10000,
			fillColor: '#0000CC'
		}
		
		circle.options = jQuery.extend(defaults, options);
		
		/* cria o circle */
		circle.circle = new google.maps.Circle({
			map: circle.options.map,
			radius: circle.options.radius,
			fillColor: circle.options.fillColor
		});
		
		/* liga o circle em um marcador */
		circle.circle.bindTo('center', circle.options.marker, 'position');
		
		/* guarda o circle */
		this.circulos.push(circle);
		
		/* retorna o circle */
		return circle;
	}
	
	this.fecharMarcadores = function()
	{
		for(var i = 0; i < this.marcadores.length; i++)
		{
			this.marcadores[i].infoWindow.close();
		}
	}

	this.zoomParaAjustar = function()
	{
		var bounds = new google.maps.LatLngBounds();
		
		for(var i in this.marcadores)
		{
			bounds.extend(this.marcadores[i].marker.position);
		}

		if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
			var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.002, bounds.getNorthEast().lng() + 0.002);
			var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.002, bounds.getNorthEast().lng() - 0.002);
			bounds.extend(extendPoint1);
			bounds.extend(extendPoint2);
		}

		this.map.fitBounds(bounds);
	}

	this.centralizarPelosMarcadores = function()
	{
		var _min_lat = 0;
		var _max_lat = 0;
		var _min_lng = 0;
		var _max_lng = 0;
		var _med_lat = 0;
		var _med_lng = 0;

		if(this.marcadores.length)
		{
			/* armazena as informações do primeiro marcador */
			_min_lat = this.marcadores[0].options.latitude;
			_max_lat = this.marcadores[0].options.latitude;
			_min_lng = this.marcadores[0].options.longitude;
			_max_lng = this.marcadores[0].options.longitude;


			for(i = 1; i < this.marcadores.length; i++)
			{
				if(this.marcadores[i].options.latitude < _min_lat) _min_lat = this.marcadores[i].options.latitude;
				if(this.marcadores[i].options.latitude > _max_lat) _max_lat = this.marcadores[i].options.latitude;
				if(this.marcadores[i].options.longitude < _min_lng) _min_lng = this.marcadores[i].options.longitude;
				if(this.marcadores[i].options.longitude > _max_lng) _max_lng = this.marcadores[i].options.longitude;
			}

			_med_lat = (_min_lat + _max_lat) / 2;
			_med_lng = (_min_lng + _max_lng) / 2;

			this.map.setCenter(new google.maps.LatLng(_med_lat,_med_lng));
		}
	}

	this.centralizarMapa = function(latitude, longitude)
	{
		this.map.setCenter(new google.maps.LatLng(latitude,longitude));
	}

	this.removerMarcadores = function(){

		if(this.marcadores.length)
		{
			for(i = 0; i < this.marcadores.length; i++)
			{
				this.marcadores[i].marker.setMap(null);
			}

			this.marcadores = [];
		}

	}

	this.setBuscadorDeCoordenadas = function(lat_selector, lng_selector)
	{
		var _this = this;

		google.maps.event.addListener(this.map, 'click', function(event) {
			/* remove os outros marcadores */
			_this.removerMarcadores();

			/* atualiza as coordenadas nos campos */

			jQuery(lat_selector).val(event.latLng.lat());
			jQuery(lng_selector).val(event.latLng.lng());
			/* adiciona o marcados */
			_this.addMarker({
				latitude : event.latLng.lat(),
				longitude : event.latLng.lng(),
				html : '',
				onClick : function(a){
					_this.removerMarcadores();
					jQuery(lat_selector).val('');
					jQuery(lng_selector).val('');
				}
			});
		});
	}

	this.agruparMarkers = function()
	{
		var markers = [];

		for(var k in this.marcadores)
		{
			markers.push(mapa.marcadores[k].marker);
		}

		new MarkerClusterer(this.map, markers);
	}

}