using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace shipments_viz.StateStores
{
    public class InMemoryStateStore<T> : IStoreState<T>, IGetState<T> where T : IEntity
    {
        private readonly List<T> _journeys = new();
        public string ETag { get; private set; } = Guid.NewGuid().ToString("N");

        public Task<T?> Get(Guid id)
        {
            var result = _journeys.Find(x => x.Id == id);

            if(result != null)
                return Task.FromResult<T?>(result);

            return Task.FromResult<T?>(default);
        }

        public Task<IEnumerable<T>> GetAll()
        {
            return Task.FromResult((IEnumerable<T>)_journeys);
        }

        public Task Save(T entity)
        {
            _journeys.Add(entity);
            ETag = Guid.NewGuid().ToString("N");
            return Task.CompletedTask;
        }
    }
}