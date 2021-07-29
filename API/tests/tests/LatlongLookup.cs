using Xunit;
using globe_viz.Domain;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using globe_viz;
using Microsoft.Extensions.DependencyInjection;

namespace tests
{
    public class LatLongLookupTests
    {
        [Fact]
        public async Task When_given_empty_list_return_default_value()
        {
            var lookup = new LatLongLookup(new Dictionary<string, (double, double)>());
            var (lat, lng) = await lookup.Get("test");

            Assert.Equal(0.0, lat);
            Assert.Equal(0.0, lng);
        }

        [Fact]
        public async Task When_matching_postcode_return_corrsponding_lat_long()
        {
            var data = new Dictionary<string, (double, double)>()
            {
                { "test", (1.2, 1.1) }
            };

            var lookup = new LatLongLookup(data);
            var (lat, lng) = await lookup.Get("test");

            Assert.Equal(1.2, lat);
            Assert.Equal(1.1, lng);
        }

        [Fact]
        public async Task When_two_keys_lookup_the_matching_lat_log()
        {
            var data = new Dictionary<string, (double, double)>()
            {
                { "test", (1.2, 1.1) },
                { "test2", (1.0, 1.0) }
            };

            var lookup = new LatLongLookup(data);
            var (lat, lng) = await lookup.Get("test2");

            Assert.Equal(1.0, lat);
            Assert.Equal(1.0, lng);
        }

        [Fact]
        public async Task When_HttpClient_Passed_In_GetAddressFromService()
        {
            var host = new WebApplicationFactory<Startup>();
            host.CreateClient();
            var lookup = host.Services.GetRequiredService<LatLongLookup>();

            var (lat, lng) = await lookup.Get("31011");

            Assert.Equal(36.91831314400665, lat);
            Assert.Equal(127.1257641109767, lng);
        }
    }

    class FakeHttpClientFactory : IHttpClientFactory
    {
        public HttpClient CreateClient(string name)
        {
            return new HttpClient();
        }
    }
}
