using System;
using System.Collections.Generic;

namespace shipments_viz.Domain
{
    public class Shipment
    {
        public ShipmentSummary ShipmentSummary { get; }
    }

    public class ShipmentSummary 
    {
        public string Reference { get; }
        public string State { get; }
        public DateTime Created { get; }
        public IEnumerable<ShipmentAddress> Addresses { get; }
    }

    public class ShipmentAddress
    {
        public string AddressType { get; }
        public string AddressLine1 { get; }
        public string PostalCode { get; }
        public LatLong LatLong { get; }
    }

    public class LatLong
    {
        public double Latitude { get; }
        public double Longitude { get; }
    }
}