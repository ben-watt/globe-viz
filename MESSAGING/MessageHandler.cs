using DotNetCore.CAP;
using System.Net.Http;
using System.Net.Http.Json;

namespace messaging_sidecar
{
    /// <summary>
    /// Handles messages from service bus to the application
    /// </summary>
    public class MessageHandler : ICapSubscribe
    {
        private readonly HttpClient _client;

        public MessageHandler(IHttpClientFactory httpClientFactory)
        {
            _client = httpClientFactory.CreateClient("app");
        }

        [CapSubscribe("servicebus.outbound.message")]
        public void ProcessMessage(object messageBody, [FromCap] CapHeader header)
        {
            // Read in config and determain where to send the message
            _client.PostAsJsonAsync("/message-inbound", messageBody, default);
        }
    }
}
