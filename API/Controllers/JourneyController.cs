using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using shipments_viz.Domain;
using shipments_viz.StateStores;

namespace shipments_viz.Controllers
{
    public class JourneyController
    {
        private readonly IGetState<Journy> _journyStore;
        private readonly IStoreState<Journy> _save;

        public JourneyController(
            IGetState<Journy> journyStore,
            IStoreState<Journy> save)
        {
            _journyStore = journyStore;
            _save = save;
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
                    Console.WriteLine("Saved Journy: {0}", JsonSerializer.Serialize(newJourny));
                }
            } catch(Exception ex) {
                throw new BadHttpRequestException("Unable to parse request", ex);
            }
        }
    }
}
