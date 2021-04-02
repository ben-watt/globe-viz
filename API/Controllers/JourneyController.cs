using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using shipments_viz.Domain;

namespace shipments_viz.Controllers
{
    public class JourneyController
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public JourneyController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task GetJourneys(HttpContext context) {
            var response = new List<Journy>() {
                new Journy(
                    DateTime.Now,
                    new Location("Manchester", -2.244644, 53.483959),
                    new Location("California", -122.271604, 37.803664)
                )
            };

            await context.Response.WriteAsJsonAsync(response);
        }

        public async Task SaveJourny(HttpContext context) {
            try
            {
                var request = await context.Request.ReadFromJsonAsync<Journy>();
                // Save the state to a dapr state store
                var store = _httpClientFactory.CreateClient("journy-store");
                //var response = await store.PostAsync("");
            } catch(Exception ex) {
                throw new BadHttpRequestException("Unable to parse request", ex);
            }

            context.Response.StatusCode = StatusCodes.Status201Created;
        }
    }
}
