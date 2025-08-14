# Multi-Threading Implementation for js-lingui

This implementation adds proper CPU-bound multi-threading support to the js-lingui CLI using Node.js worker_threads, replacing the incorrect Promise.all concurrent approach from the original patch.

## Key Features

### 1. Experimental Configuration Option
- Added `experimental.multiThreading` boolean option to the Lingui configuration
- When enabled, the CLI uses worker threads for CPU-bound operations
- Default: `false` for backward compatibility

### 2. Worker Thread Implementation

#### Extract Worker (`extractWorker.ts`)
- Handles file extraction in separate threads
- Processes individual files and returns extracted messages
- Includes proper error handling and message merging

#### Compile Worker (`compileWorker.ts`) 
- Handles message compilation in separate threads
- Compiles message strings into optimized formats
- Supports all namespace types (es, ts, cjs, etc.)

#### Task Queue System (`taskQueue.ts`)
- Manages worker pool with automatic scaling up to CPU count
- Handles task distribution and result collection
- Provides graceful error handling and worker cleanup

### 3. Multi-Threading Logic

#### Compilation
- **When enabled**: Uses worker threads to compile locales in parallel
- **CPU utilization**: Scales to number of CPU cores
- **Performance**: Significant improvement for projects with many locales

#### Extraction  
- **Approach**: Uses sequential processing for safety
- **Reason**: Custom extractors may contain user-defined, non-serializable functions
- **Compatibility**: Ensures all existing extractors continue to work

### 4. Backward Compatibility
- Single-threaded mode remains the default
- Existing configurations work without changes
- All Promise.all patterns replaced with proper sequential/worker-based processing

## Usage

Enable multi-threading in your `lingui.config.js`:

```javascript
export default {
  locales: ["en", "es", "fr"],
  // ... other config
  experimental: {
    multiThreading: true
  }
}
```

## Architecture Decisions

### Why Sequential Extraction?
- Custom extractors may use functions that cannot be serialized to workers
- Format operations like `po` may contain user-defined formatting functions
- Sequential processing ensures 100% compatibility

### Why Worker Threads for Compilation?
- Message compilation is pure CPU-bound work
- Uses only serializable data (strings, objects)
- Significant performance gains for multiple locales

### Error Handling
- Workers include proper error propagation
- Failed tasks don't crash the entire process
- Graceful fallback to single-threaded mode on worker errors

## Testing

Comprehensive test suite (`multiThread.test.ts`) ensures:
- Identical output between single-thread and multi-thread modes
- Proper error handling in both modes
- Performance improvements with multi-threading
- Compatibility with all existing functionality

## Performance Impact

Expected improvements:
- **Compilation**: ~2-4x faster with 4+ CPU cores for projects with multiple locales
- **Extraction**: No performance change (sequential for compatibility)
- **Memory**: Slightly higher due to worker overhead
- **CPU**: Better utilization of multi-core systems

## File Structure

```
packages/cli/src/api/catalog/workers/
├── extractWorker.ts           # Extract worker implementation
├── compileWorker.ts          # Compile worker implementation  
├── taskQueue.ts              # Worker pool and task management
├── extractFromFilesMultiThread.ts  # Multi-thread extract utilities
├── compileMultiThread.ts     # Multi-thread compile utilities
└── multiThread.test.ts       # Comprehensive test suite
```

## Migration Notes

This implementation:
1. ✅ Replaces incorrect Promise.all concurrent processing
2. ✅ Uses proper worker_threads for CPU-bound operations
3. ✅ Maintains compatibility with existing extractors
4. ✅ Includes comprehensive testing
5. ✅ Provides significant performance improvements for compilation
6. ✅ Handles serialization limitations properly