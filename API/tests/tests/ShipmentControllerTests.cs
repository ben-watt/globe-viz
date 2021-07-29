using globe_viz;
using globe_viz.Controllers;
using globe_viz.Domain;
using Microsoft.AspNetCore.Mvc.Testing;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace tests
{
    public class ShipmentControllerTests
    {
        [Fact] 
        public async Task ShipmentController_Tests()
        {
            var host = new WebApplicationFactory<Startup>();
            var client = host.CreateClient();

            var content = new Shipment()
            {
                ShipmentSummary = new ShipmentSummary()
                {
                    Addresses = new List<ShipmentAddress>()
                    {
                        new ShipmentAddress()
                        {
                            AddressLine1 = "Origin Address Line 1",
                            AddressType = "Origin",
                            LatLong = null,
                            PostalCode = "31011"
                        },
                        new ShipmentAddress()
                        {
                            AddressLine1 = "Destination Address Line 1",
                            AddressType = "Destination",
                            LatLong = new LatLong() {
                                Latitude = 35.0,
                                Longitude = 10.0
                            },
                            PostalCode = ""
                        },
                    },
                    Created = DateTime.Now,
                    Reference = "sp_123",
                    State = "created"
                }
            };

            var response = await client.PostAsJsonAsync("/api/shipment",
                content,
                options: new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = new SnakeCaseNamingPolicy()
                });

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }
    }
}
