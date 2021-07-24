using System;
using System.Collections.Generic;

namespace shipments_viz.Domain
{
    public class Shipment
    {
        public ShipmentSummary ShipmentSummary { get; init; }
    }

    public class ShipmentSummary
    {
        public string Reference { get; init; }
        public string State { get; init; }
        public DateTime Created { get; init; }
        public IEnumerable<ShipmentAddress> Addresses { get; init; }
    }

    public class ShipmentAddress
    {
        public string AddressType { get; init;  }
        public string AddressLine1 { get; init;  }
        public string PostalCode { get; init;  }
        public LatLong LatLong { get; init;  }
    }

    public class LatLong
    {
        public double Latitude { get; init;  }
        public double Longitude { get; init; }
    }
}