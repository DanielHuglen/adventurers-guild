import { City, CityVar } from './mission-model';

export function getCityName(city: CityVar): City {
	switch (city) {
		case 'waterdeep':
			return 'Waterdeep';
		case 'neverwinter':
			return 'Neverwinter';
		case 'baldursGate':
			return "Baldur's Gate";
		case 'luskan':
			return 'Luskan';
		case 'mirabar':
			return 'Mirabar';
		case 'silverymoon':
			return 'Silverymoon';
		case 'piltover':
			return 'Piltover';
		case 'moonsheaIsles':
			return 'Moonshae Isles';
	}
}
