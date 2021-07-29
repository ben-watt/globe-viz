using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using globe_viz.Domain;
using globe_viz.StateStores;
using System.Linq;

namespace globe_viz.Controllers
{
    public class JourneyController
    {
        private readonly IGetState<Journy> _journyStore;
        private readonly IStoreState<Journy> _save;
        private readonly LatLongLookup _latLongLookup;

        public JourneyController(
            IGetState<Journy> journyStore,
            IStoreState<Journy> save,
            LatLongLookup latLongLookup)
        {
            _journyStore = journyStore;
            _save = save;
            _latLongLookup = latLongLookup;
        }

        public async Task GetJourneys(HttpContext context)
        {
            if(context.Request.Headers.TryGetValue("If-None-Match", out var eTag) && eTag == _journyStore.ETag)
            {
                context.Response.StatusCode = StatusCodes.Status304NotModified;
            }
            else
            {
                var journeys = await _journyStore.GetAll();
                context.Response.Headers["ETag"] = _journyStore.ETag;
                await context.Response.WriteAsJsonAsync(journeys);
            }
        }

        public async Task SaveJourny(HttpContext context)
        {
            try
            {
                var request = await context.Request.ReadFromJsonAsync<Journy>();
                if(request != null)
                {
                    var newJourny = request with { Id = Guid.NewGuid() };
                    await _save.Save(newJourny);
                    context.Response.StatusCode = StatusCodes.Status201Created;
                    Console.WriteLine("Saved Journy: {0}", newJourny.Id);
                }
            } catch(Exception ex) {
                throw new BadHttpRequestException("Unable to parse request", ex);
            }
        }

        public async Task SaveShipment(HttpContext context)
        {
            try
            {
                var options = new JsonSerializerOptions() {
                    PropertyNamingPolicy = new SnakeCaseNamingPolicy()
                };

                var request = await context.Request.ReadFromJsonAsync<Shipment>(options);

                Console.WriteLine(JsonSerializer.Serialize(request, options));
                if(request != null)
                {
                    var journey = await CreateJourney(request);
                    await _save.Save(journey);
                    context.Response.StatusCode = StatusCodes.Status201Created;
                    Console.WriteLine("Saved Journy: {0}", journey.Id);
                }
            } catch(Exception ex) {
                throw new BadHttpRequestException("Unable to parse request", ex);
            }
        }

        private async Task<Journy> CreateJourney(Shipment request)
        {
            var id = Guid.NewGuid();
            var date = request.ShipmentSummary.Created;

            var origin = request.ShipmentSummary.Addresses.First(x => x.AddressType == "Origin");
            var destination = request.ShipmentSummary.Addresses.First(x => x.AddressType == "Destination");

            var from = await MapLocation(origin);
            var to = await MapLocation(destination);

            return new Journy(id, date, from, to);
        }

        private async Task<Location> MapLocation(ShipmentAddress address)
        {
            if (address.LatLong is null)
            {
                var latLng = await _latLongLookup.Get(address.PostalCode);
                return new Location(address.AddressLine1, latLng.Lat, latLng.Lng);
            }
            else
            {
                return new Location(address.AddressLine1, address.LatLong.Latitude, address.LatLong.Longitude);
            }
        }
    }
}
