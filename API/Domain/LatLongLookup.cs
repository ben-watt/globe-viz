using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using shipments_viz.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace globe_viz.Domain
{
    public class LatLongLookup
    {
        private readonly IDictionary<string, (double, double)> _postcodes;
        private readonly IHttpClientFactory? _clientFactory;
        private readonly string _geoNameUserName;

        public LatLongLookup(IHttpClientFactory clientFactory, IOptions<GeoNames> geoNameConfig)
        {
            _clientFactory = clientFactory;

            if (geoNameConfig.Value.UserName is null)
                throw new ArgumentException("GeoNames.UserName has not been supplied. Unable to lookup postcodes using that service.\n"
                    + "User appsettings.json or set the envrionment variable GLOBEVIZ_GEONAMES__USERNAME");

            _geoNameUserName = geoNameConfig.Value.UserName;
        }

        public LatLongLookup(IDictionary<string, (double, double)> postcodes)
        {
            if (postcodes == null)
                throw new System.ArgumentNullException(nameof(postcodes));

            _postcodes = postcodes;
        }

        public async Task<(double Lat, double Lng)> Get(string postcode)
        {
            if(_clientFactory != null)
            {
                LatLng? matchingPostCode = await LookupPostcode();

                if (matchingPostCode != null)
                    return (matchingPostCode.Lat, matchingPostCode.Lng);
            }

            if (_postcodes.TryGetValue(postcode, out var latLng))
            {
                return latLng;
            }

            return (0.0, 0.0);
        }

        private async Task<LatLng> LookupPostcode()
        {
            var geoNamesClient = _clientFactory.CreateClient("geo-names");
            var response = await geoNamesClient.GetFromJsonAsync<PostalCodeSearchJsonResponse>(
                $"/postalCodeSearchJSON?postalcode=31011&maxRows=1&username={_geoNameUserName}");

            return response?.PostalCodes?.FirstOrDefault();
        }
    }

    record PostalCodeSearchJsonResponse(IEnumerable<LatLng> PostalCodes);

    record LatLng(double Lat, double Lng);
}