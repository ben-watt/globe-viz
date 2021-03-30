using System;

namespace shipments_viz.Domain
{
    internal record Journy(
        DateTime Date,
        Location From,
        Location To
    );
}