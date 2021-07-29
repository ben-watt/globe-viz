using globe_viz;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using shipments_viz.Config;
using System.Collections.Generic;
using Xunit;

namespace tests
{
    public class ConfigTests
    {
        [Fact]
        public void When_config_contains_GeoNames_UserName_Return_The_Correct_Value()
        {
            const string expectedUserName = "test";
            var host = new WebApplicationFactory<Startup>().WithWebHostBuilder(config =>
            {
                config.ConfigureAppConfiguration(builder =>
                {
                    var config = new Dictionary<string, string>()
                    {
                        { "GeoNames:UserName", expectedUserName}
                    };

                    builder.AddInMemoryCollection(config);
                });
            });

            var _ = host.CreateClient();
            var config = host.Services.GetRequiredService<IOptions<GeoNames>>();

            Assert.Equal(expectedUserName, config.Value.UserName);
        }
    }
}
