'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
var _Resource_rid;
/**
 * Invoke your custom commands.
 *
 * This package is also accessible with `window.__TAURI__.core` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
 * @module
 */
/**
 * A key to be used to implement a special function
 * on your types that define how your type should be serialized
 * when passing across the IPC.
 * @example
 * Given a type in Rust that looks like this
 * ```rs
 * #[derive(serde::Serialize, serde::Deserialize)
 * enum UserId {
 *   String(String),
 *   Number(u32),
 * }
 * ```
 * `UserId::String("id")` would be serialized into `{ String: "id" }`
 * and so we need to pass the same structure back to Rust
 * ```ts
 * import { SERIALIZE_TO_IPC_FN } from "@tauri-apps/api/core"
 *
 * class UserIdString {
 *   id
 *   constructor(id) {
 *     this.id = id
 *   }
 *
 *   [SERIALIZE_TO_IPC_FN]() {
 *     return { String: this.id }
 *   }
 * }
 *
 * class UserIdNumber {
 *   id
 *   constructor(id) {
 *     this.id = id
 *   }
 *
 *   [SERIALIZE_TO_IPC_FN]() {
 *     return { Number: this.id }
 *   }
 * }
 *
 *
 * type UserId = UserIdString | UserIdNumber
 * ```
 *
 */
// if this value changes, make sure to update it in:
// 1. ipc.js
// 2. process-ipc-message-fn.js
const SERIALIZE_TO_IPC_FN = '__TAURI_TO_IPC_KEY__';
/**
 * Transforms a callback function to a string identifier that can be passed to the backend.
 * The backend uses the identifier to `eval()` the callback.
 *
 * @return A unique identifier associated with the callback function.
 *
 * @since 1.0.0
 */
function transformCallback(callback, once = false) {
    return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
/**
 * Sends a message to the backend.
 * @example
 * ```typescript
 * import { invoke } from '@tauri-apps/api/core';
 * await invoke('login', { user: 'tauri', password: 'poiwe3h4r5ip3yrhtew9ty' });
 * ```
 *
 * @param cmd The command name.
 * @param args The optional arguments to pass to the command.
 * @param options The request options.
 * @return A promise resolving or rejecting to the backend response.
 *
 * @since 1.0.0
 */
async function invoke(cmd, args = {}, options) {
    return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
/**
 * A rust-backed resource stored through `tauri::Manager::resources_table` API.
 *
 * The resource lives in the main process and does not exist
 * in the Javascript world, and thus will not be cleaned up automatiacally
 * except on application exit. If you want to clean it up early, call {@linkcode Resource.close}
 *
 * @example
 * ```typescript
 * import { Resource, invoke } from '@tauri-apps/api/core';
 * export class DatabaseHandle extends Resource {
 *   static async open(path: string): Promise<DatabaseHandle> {
 *     const rid: number = await invoke('open_db', { path });
 *     return new DatabaseHandle(rid);
 *   }
 *
 *   async execute(sql: string): Promise<void> {
 *     await invoke('execute_sql', { rid: this.rid, sql });
 *   }
 * }
 * ```
 */
class Resource {
    get rid() {
        return __classPrivateFieldGet(this, _Resource_rid, "f");
    }
    constructor(rid) {
        _Resource_rid.set(this, void 0);
        __classPrivateFieldSet(this, _Resource_rid, rid);
    }
    /**
     * Destroys and cleans up this resource from memory.
     * **You should not call any method on this object anymore and should drop any reference to it.**
     */
    async close() {
        return invoke('plugin:resources|close', {
            rid: this.rid
        });
    }
}
_Resource_rid = new WeakMap();

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/** An RGBA Image in row-major order from top to bottom. */
class Image extends Resource {
    /**
     * Creates an Image from a resource ID. For internal use only.
     *
     * @ignore
     */
    constructor(rid) {
        super(rid);
    }
    /** Creates a new Image using RGBA data, in row-major order from top to bottom, and with specified width and height. */
    static async new(rgba, width, height) {
        return invoke('plugin:image|new', {
            rgba: transformImage(rgba),
            width,
            height
        }).then((rid) => new Image(rid));
    }
    /**
     * Creates a new image using the provided bytes by inferring the file format.
     * If the format is known, prefer [@link Image.fromPngBytes] or [@link Image.fromIcoBytes].
     *
     * Only `ico` and `png` are supported (based on activated feature flag).
     *
     * Note that you need the `image-ico` or `image-png` Cargo features to use this API.
     * To enable it, change your Cargo.toml file:
     * ```toml
     * [dependencies]
     * tauri = { version = "...", features = ["...", "image-png"] }
     * ```
     */
    static async fromBytes(bytes) {
        return invoke('plugin:image|from_bytes', {
            bytes: transformImage(bytes)
        }).then((rid) => new Image(rid));
    }
    /**
     * Creates a new image using the provided path.
     *
     * Only `ico` and `png` are supported (based on activated feature flag).
     *
     * Note that you need the `image-ico` or `image-png` Cargo features to use this API.
     * To enable it, change your Cargo.toml file:
     * ```toml
     * [dependencies]
     * tauri = { version = "...", features = ["...", "image-png"] }
     * ```
     */
    static async fromPath(path) {
        return invoke('plugin:image|from_path', { path }).then((rid) => new Image(rid));
    }
    /** Returns the RGBA data for this image, in row-major order from top to bottom.  */
    async rgba() {
        return invoke('plugin:image|rgba', {
            rid: this.rid
        }).then((buffer) => new Uint8Array(buffer));
    }
    /** Returns the size of this image.  */
    async size() {
        return invoke('plugin:image|size', { rid: this.rid });
    }
}
/**
 * Transforms image from various types into a type acceptable by Rust.
 *
 * See [tauri::image::JsImage](https://docs.rs/tauri/2/tauri/image/enum.JsImage.html) for more information.
 * Note the API signature is not stable and might change.
 */
function transformImage(image) {
    const ret = image == null
        ? null
        : typeof image === 'string'
            ? image
            : image instanceof Image
                ? image.rid
                : image;
    return ret;
}

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * A size represented in logical pixels.
 *
 * @since 2.0.0
 */
class LogicalSize {
    constructor(...args) {
        this.type = 'Logical';
        if (args.length === 1) {
            if ('Logical' in args[0]) {
                this.width = args[0].Logical.width;
                this.height = args[0].Logical.height;
            }
            else {
                this.width = args[0].width;
                this.height = args[0].height;
            }
        }
        else {
            this.width = args[0];
            this.height = args[1];
        }
    }
    /**
     * Converts the logical size to a physical one.
     * @example
     * ```typescript
     * import { LogicalSize } from '@tauri-apps/api/dpi';
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     *
     * const appWindow = getCurrentWindow();
     * const factor = await appWindow.scaleFactor();
     * const size = new LogicalSize(400, 500);
     * const physical = size.toPhysical(factor);
     * ```
     *
     * @since 2.0.0
     */
    toPhysical(scaleFactor) {
        return new PhysicalSize(this.width * scaleFactor, this.height * scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
        return {
            width: this.width,
            height: this.height
        };
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}
/**
 * A size represented in physical pixels.
 *
 * @since 2.0.0
 */
class PhysicalSize {
    constructor(...args) {
        this.type = 'Physical';
        if (args.length === 1) {
            if ('Physical' in args[0]) {
                this.width = args[0].Physical.width;
                this.height = args[0].Physical.height;
            }
            else {
                this.width = args[0].width;
                this.height = args[0].height;
            }
        }
        else {
            this.width = args[0];
            this.height = args[1];
        }
    }
    /**
     * Converts the physical size to a logical one.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const appWindow = getCurrentWindow();
     * const factor = await appWindow.scaleFactor();
     * const size = await appWindow.innerSize(); // PhysicalSize
     * const logical = size.toLogical(factor);
     * ```
     */
    toLogical(scaleFactor) {
        return new LogicalSize(this.width / scaleFactor, this.height / scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
        return {
            width: this.width,
            height: this.height
        };
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}
/**
 * A size represented either in physical or in logical pixels.
 *
 * This type is basically a union type of {@linkcode LogicalSize} and {@linkcode PhysicalSize}
 * but comes in handy when using `tauri::Size` in Rust as an argument to a command, as this class
 * automatically serializes into a valid format so it can be deserialized correctly into `tauri::Size`
 *
 * So instead of
 * ```typescript
 * import { invoke } from '@tauri-apps/api/core';
 * import { LogicalSize, PhysicalSize } from '@tauri-apps/api/dpi';
 *
 * const size: LogicalSize | PhysicalSize = someFunction(); // where someFunction returns either LogicalSize or PhysicalSize
 * const validSize = size instanceof LogicalSize
 *   ? { Logical: { width: size.width, height: size.height } }
 *   : { Physical: { width: size.width, height: size.height } }
 * await invoke("do_something_with_size", { size: validSize });
 * ```
 *
 * You can just use {@linkcode Size}
 * ```typescript
 * import { invoke } from '@tauri-apps/api/core';
 * import { LogicalSize, PhysicalSize, Size } from '@tauri-apps/api/dpi';
 *
 * const size: LogicalSize | PhysicalSize = someFunction(); // where someFunction returns either LogicalSize or PhysicalSize
 * const validSize = new Size(size);
 * await invoke("do_something_with_size", { size: validSize });
 * ```
 *
 * @since 2.1.0
 */
class Size {
    constructor(size) {
        this.size = size;
    }
    toLogical(scaleFactor) {
        return this.size instanceof LogicalSize
            ? this.size
            : this.size.toLogical(scaleFactor);
    }
    toPhysical(scaleFactor) {
        return this.size instanceof PhysicalSize
            ? this.size
            : this.size.toPhysical(scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
        return {
            [`${this.size.type}`]: {
                width: this.size.width,
                height: this.size.height
            }
        };
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}
/**
 *  A position represented in logical pixels.
 *
 * @since 2.0.0
 */
class LogicalPosition {
    constructor(...args) {
        this.type = 'Logical';
        if (args.length === 1) {
            if ('Logical' in args[0]) {
                this.x = args[0].Logical.x;
                this.y = args[0].Logical.y;
            }
            else {
                this.x = args[0].x;
                this.y = args[0].y;
            }
        }
        else {
            this.x = args[0];
            this.y = args[1];
        }
    }
    /**
     * Converts the logical position to a physical one.
     * @example
     * ```typescript
     * import { LogicalPosition } from '@tauri-apps/api/dpi';
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     *
     * const appWindow = getCurrentWindow();
     * const factor = await appWindow.scaleFactor();
     * const position = new LogicalPosition(400, 500);
     * const physical = position.toPhysical(factor);
     * ```
     *
     * @since 2.0.0
     */
    toPhysical(scaleFactor) {
        return new PhysicalPosition(this.x * scaleFactor, this.y * scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
        return {
            x: this.x,
            y: this.y
        };
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}
/**
 *  A position represented in physical pixels.
 *
 * @since 2.0.0
 */
class PhysicalPosition {
    constructor(...args) {
        this.type = 'Physical';
        if (args.length === 1) {
            if ('Physical' in args[0]) {
                this.x = args[0].Physical.x;
                this.y = args[0].Physical.y;
            }
            else {
                this.x = args[0].x;
                this.y = args[0].y;
            }
        }
        else {
            this.x = args[0];
            this.y = args[1];
        }
    }
    /**
     * Converts the physical position to a logical one.
     * @example
     * ```typescript
     * import { PhysicalPosition } from '@tauri-apps/api/dpi';
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     *
     * const appWindow = getCurrentWindow();
     * const factor = await appWindow.scaleFactor();
     * const position = new PhysicalPosition(400, 500);
     * const physical = position.toLogical(factor);
     * ```
     *
     * @since 2.0.0
     */
    toLogical(scaleFactor) {
        return new LogicalPosition(this.x / scaleFactor, this.y / scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
        return {
            x: this.x,
            y: this.y
        };
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}
/**
 * A position represented either in physical or in logical pixels.
 *
 * This type is basically a union type of {@linkcode LogicalSize} and {@linkcode PhysicalSize}
 * but comes in handy when using `tauri::Position` in Rust as an argument to a command, as this class
 * automatically serializes into a valid format so it can be deserialized correctly into `tauri::Position`
 *
 * So instead of
 * ```typescript
 * import { invoke } from '@tauri-apps/api/core';
 * import { LogicalPosition, PhysicalPosition } from '@tauri-apps/api/dpi';
 *
 * const position: LogicalPosition | PhysicalPosition = someFunction(); // where someFunction returns either LogicalPosition or PhysicalPosition
 * const validPosition = position instanceof LogicalPosition
 *   ? { Logical: { x: position.x, y: position.y } }
 *   : { Physical: { x: position.x, y: position.y } }
 * await invoke("do_something_with_position", { position: validPosition });
 * ```
 *
 * You can just use {@linkcode Position}
 * ```typescript
 * import { invoke } from '@tauri-apps/api/core';
 * import { LogicalPosition, PhysicalPosition, Position } from '@tauri-apps/api/dpi';
 *
 * const position: LogicalPosition | PhysicalPosition = someFunction(); // where someFunction returns either LogicalPosition or PhysicalPosition
 * const validPosition = new Position(position);
 * await invoke("do_something_with_position", { position: validPosition });
 * ```
 *
 * @since 2.1.0
 */
class Position {
    constructor(position) {
        this.position = position;
    }
    toLogical(scaleFactor) {
        return this.position instanceof LogicalPosition
            ? this.position
            : this.position.toLogical(scaleFactor);
    }
    toPhysical(scaleFactor) {
        return this.position instanceof PhysicalPosition
            ? this.position
            : this.position.toPhysical(scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
        return {
            [`${this.position.type}`]: {
                x: this.position.x,
                y: this.position.y
            }
        };
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * The event system allows you to emit events to the backend and listen to events from it.
 *
 * This package is also accessible with `window.__TAURI__.event` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
 * @module
 */
/**
 * @since 1.1.0
 */
var TauriEvent;
(function (TauriEvent) {
    TauriEvent["WINDOW_RESIZED"] = "tauri://resize";
    TauriEvent["WINDOW_MOVED"] = "tauri://move";
    TauriEvent["WINDOW_CLOSE_REQUESTED"] = "tauri://close-requested";
    TauriEvent["WINDOW_DESTROYED"] = "tauri://destroyed";
    TauriEvent["WINDOW_FOCUS"] = "tauri://focus";
    TauriEvent["WINDOW_BLUR"] = "tauri://blur";
    TauriEvent["WINDOW_SCALE_FACTOR_CHANGED"] = "tauri://scale-change";
    TauriEvent["WINDOW_THEME_CHANGED"] = "tauri://theme-changed";
    TauriEvent["WINDOW_CREATED"] = "tauri://window-created";
    TauriEvent["WEBVIEW_CREATED"] = "tauri://webview-created";
    TauriEvent["DRAG_ENTER"] = "tauri://drag-enter";
    TauriEvent["DRAG_OVER"] = "tauri://drag-over";
    TauriEvent["DRAG_DROP"] = "tauri://drag-drop";
    TauriEvent["DRAG_LEAVE"] = "tauri://drag-leave";
})(TauriEvent || (TauriEvent = {}));
/**
 * Unregister the event listener associated with the given name and id.
 *
 * @ignore
 * @param event The event name
 * @param eventId Event identifier
 * @returns
 */
async function _unlisten(event, eventId) {
    await invoke('plugin:event|unlisten', {
        event,
        eventId
    });
}
/**
 * Listen to an emitted event to any {@link EventTarget|target}.
 *
 * @example
 * ```typescript
 * import { listen } from '@tauri-apps/api/event';
 * const unlisten = await listen<string>('error', (event) => {
 *   console.log(`Got error, payload: ${event.payload}`);
 * });
 *
 * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
 * unlisten();
 * ```
 *
 * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
 * @param handler Event handler callback.
 * @param options Event listening options.
 * @returns A promise resolving to a function to unlisten to the event.
 * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
 *
 * @since 1.0.0
 */
async function listen(event, handler, options) {
    var _a;
    const target = typeof (options === null || options === void 0 ? void 0 : options.target) === 'string'
        ? { kind: 'AnyLabel', label: options.target }
        : ((_a = options === null || options === void 0 ? void 0 : options.target) !== null && _a !== void 0 ? _a : { kind: 'Any' });
    return invoke('plugin:event|listen', {
        event,
        target,
        handler: transformCallback(handler)
    }).then((eventId) => {
        return async () => _unlisten(event, eventId);
    });
}
/**
 * Listens once to an emitted event to any {@link EventTarget|target}.
 *
 * @example
 * ```typescript
 * import { once } from '@tauri-apps/api/event';
 * interface LoadedPayload {
 *   loggedIn: boolean,
 *   token: string
 * }
 * const unlisten = await once<LoadedPayload>('loaded', (event) => {
 *   console.log(`App is loaded, loggedIn: ${event.payload.loggedIn}, token: ${event.payload.token}`);
 * });
 *
 * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
 * unlisten();
 * ```
 *
 * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
 * @param handler Event handler callback.
 * @param options Event listening options.
 * @returns A promise resolving to a function to unlisten to the event.
 * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
 *
 * @since 1.0.0
 */
async function once(event, handler, options) {
    return listen(event, (eventData) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        _unlisten(event, eventData.id);
        handler(eventData);
    }, options);
}
/**
 * Emits an event to all {@link EventTarget|targets}.
 *
 * @example
 * ```typescript
 * import { emit } from '@tauri-apps/api/event';
 * await emit('frontend-loaded', { loggedIn: true, token: 'authToken' });
 * ```
 *
 * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
 * @param payload Event payload.
 *
 * @since 1.0.0
 */
async function emit(event, payload) {
    await invoke('plugin:event|emit', {
        event,
        payload
    });
}
/**
 * Emits an event to all {@link EventTarget|targets} matching the given target.
 *
 * @example
 * ```typescript
 * import { emitTo } from '@tauri-apps/api/event';
 * await emitTo('main', 'frontend-loaded', { loggedIn: true, token: 'authToken' });
 * ```
 *
 * @param target Label of the target Window/Webview/WebviewWindow or raw {@link EventTarget} object.
 * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
 * @param payload Event payload.
 *
 * @since 2.0.0
 */
async function emitTo(target, event, payload) {
    const eventTarget = typeof target === 'string' ? { kind: 'AnyLabel', label: target } : target;
    await invoke('plugin:event|emit_to', {
        target: eventTarget,
        event,
        payload
    });
}

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * A native Icon to be used for the menu item
 *
 * #### Platform-specific:
 *
 * - **Windows / Linux**: Unsupported.
 */
var NativeIcon;
(function (NativeIcon) {
    /** An add item template image. */
    NativeIcon["Add"] = "Add";
    /** Advanced preferences toolbar icon for the preferences window. */
    NativeIcon["Advanced"] = "Advanced";
    /** A Bluetooth template image. */
    NativeIcon["Bluetooth"] = "Bluetooth";
    /** Bookmarks image suitable for a template. */
    NativeIcon["Bookmarks"] = "Bookmarks";
    /** A caution image. */
    NativeIcon["Caution"] = "Caution";
    /** A color panel toolbar icon. */
    NativeIcon["ColorPanel"] = "ColorPanel";
    /** A column view mode template image. */
    NativeIcon["ColumnView"] = "ColumnView";
    /** A computer icon. */
    NativeIcon["Computer"] = "Computer";
    /** An enter full-screen mode template image. */
    NativeIcon["EnterFullScreen"] = "EnterFullScreen";
    /** Permissions for all users. */
    NativeIcon["Everyone"] = "Everyone";
    /** An exit full-screen mode template image. */
    NativeIcon["ExitFullScreen"] = "ExitFullScreen";
    /** A cover flow view mode template image. */
    NativeIcon["FlowView"] = "FlowView";
    /** A folder image. */
    NativeIcon["Folder"] = "Folder";
    /** A burnable folder icon. */
    NativeIcon["FolderBurnable"] = "FolderBurnable";
    /** A smart folder icon. */
    NativeIcon["FolderSmart"] = "FolderSmart";
    /** A link template image. */
    NativeIcon["FollowLinkFreestanding"] = "FollowLinkFreestanding";
    /** A font panel toolbar icon. */
    NativeIcon["FontPanel"] = "FontPanel";
    /** A `go back` template image. */
    NativeIcon["GoLeft"] = "GoLeft";
    /** A `go forward` template image. */
    NativeIcon["GoRight"] = "GoRight";
    /** Home image suitable for a template. */
    NativeIcon["Home"] = "Home";
    /** An iChat Theater template image. */
    NativeIcon["IChatTheater"] = "IChatTheater";
    /** An icon view mode template image. */
    NativeIcon["IconView"] = "IconView";
    /** An information toolbar icon. */
    NativeIcon["Info"] = "Info";
    /** A template image used to denote invalid data. */
    NativeIcon["InvalidDataFreestanding"] = "InvalidDataFreestanding";
    /** A generic left-facing triangle template image. */
    NativeIcon["LeftFacingTriangle"] = "LeftFacingTriangle";
    /** A list view mode template image. */
    NativeIcon["ListView"] = "ListView";
    /** A locked padlock template image. */
    NativeIcon["LockLocked"] = "LockLocked";
    /** An unlocked padlock template image. */
    NativeIcon["LockUnlocked"] = "LockUnlocked";
    /** A horizontal dash, for use in menus. */
    NativeIcon["MenuMixedState"] = "MenuMixedState";
    /** A check mark template image, for use in menus. */
    NativeIcon["MenuOnState"] = "MenuOnState";
    /** A MobileMe icon. */
    NativeIcon["MobileMe"] = "MobileMe";
    /** A drag image for multiple items. */
    NativeIcon["MultipleDocuments"] = "MultipleDocuments";
    /** A network icon. */
    NativeIcon["Network"] = "Network";
    /** A path button template image. */
    NativeIcon["Path"] = "Path";
    /** General preferences toolbar icon for the preferences window. */
    NativeIcon["PreferencesGeneral"] = "PreferencesGeneral";
    /** A Quick Look template image. */
    NativeIcon["QuickLook"] = "QuickLook";
    /** A refresh template image. */
    NativeIcon["RefreshFreestanding"] = "RefreshFreestanding";
    /** A refresh template image. */
    NativeIcon["Refresh"] = "Refresh";
    /** A remove item template image. */
    NativeIcon["Remove"] = "Remove";
    /** A reveal contents template image. */
    NativeIcon["RevealFreestanding"] = "RevealFreestanding";
    /** A generic right-facing triangle template image. */
    NativeIcon["RightFacingTriangle"] = "RightFacingTriangle";
    /** A share view template image. */
    NativeIcon["Share"] = "Share";
    /** A slideshow template image. */
    NativeIcon["Slideshow"] = "Slideshow";
    /** A badge for a `smart` item. */
    NativeIcon["SmartBadge"] = "SmartBadge";
    /** Small green indicator, similar to iChat's available image. */
    NativeIcon["StatusAvailable"] = "StatusAvailable";
    /** Small clear indicator. */
    NativeIcon["StatusNone"] = "StatusNone";
    /** Small yellow indicator, similar to iChat's idle image. */
    NativeIcon["StatusPartiallyAvailable"] = "StatusPartiallyAvailable";
    /** Small red indicator, similar to iChat's unavailable image. */
    NativeIcon["StatusUnavailable"] = "StatusUnavailable";
    /** A stop progress template image. */
    NativeIcon["StopProgressFreestanding"] = "StopProgressFreestanding";
    /** A stop progress button template image. */
    NativeIcon["StopProgress"] = "StopProgress";
    /** An image of the empty trash can. */
    NativeIcon["TrashEmpty"] = "TrashEmpty";
    /** An image of the full trash can. */
    NativeIcon["TrashFull"] = "TrashFull";
    /** Permissions for a single user. */
    NativeIcon["User"] = "User";
    /** User account toolbar icon for the preferences window. */
    NativeIcon["UserAccounts"] = "UserAccounts";
    /** Permissions for a group of users. */
    NativeIcon["UserGroup"] = "UserGroup";
    /** Permissions for guests. */
    NativeIcon["UserGuest"] = "UserGuest";
})(NativeIcon || (NativeIcon = {}));

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * The path module provides utilities for working with file and directory paths.
 *
 * This package is also accessible with `window.__TAURI__.path` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
 *
 * It is recommended to allowlist only the APIs you use for optimal bundle size and security.
 * @module
 */
/**
 * @since 2.0.0
 */
var BaseDirectory;
(function (BaseDirectory) {
    BaseDirectory[BaseDirectory["Audio"] = 1] = "Audio";
    BaseDirectory[BaseDirectory["Cache"] = 2] = "Cache";
    BaseDirectory[BaseDirectory["Config"] = 3] = "Config";
    BaseDirectory[BaseDirectory["Data"] = 4] = "Data";
    BaseDirectory[BaseDirectory["LocalData"] = 5] = "LocalData";
    BaseDirectory[BaseDirectory["Document"] = 6] = "Document";
    BaseDirectory[BaseDirectory["Download"] = 7] = "Download";
    BaseDirectory[BaseDirectory["Picture"] = 8] = "Picture";
    BaseDirectory[BaseDirectory["Public"] = 9] = "Public";
    BaseDirectory[BaseDirectory["Video"] = 10] = "Video";
    BaseDirectory[BaseDirectory["Resource"] = 11] = "Resource";
    BaseDirectory[BaseDirectory["Temp"] = 12] = "Temp";
    BaseDirectory[BaseDirectory["AppConfig"] = 13] = "AppConfig";
    BaseDirectory[BaseDirectory["AppData"] = 14] = "AppData";
    BaseDirectory[BaseDirectory["AppLocalData"] = 15] = "AppLocalData";
    BaseDirectory[BaseDirectory["AppCache"] = 16] = "AppCache";
    BaseDirectory[BaseDirectory["AppLog"] = 17] = "AppLog";
    BaseDirectory[BaseDirectory["Desktop"] = 18] = "Desktop";
    BaseDirectory[BaseDirectory["Executable"] = 19] = "Executable";
    BaseDirectory[BaseDirectory["Font"] = 20] = "Font";
    BaseDirectory[BaseDirectory["Home"] = 21] = "Home";
    BaseDirectory[BaseDirectory["Runtime"] = 22] = "Runtime";
    BaseDirectory[BaseDirectory["Template"] = 23] = "Template";
})(BaseDirectory || (BaseDirectory = {}));

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Provides APIs to create windows, communicate with other windows and manipulate the current window.
 *
 * #### Window events
 *
 * Events can be listened to using {@link Window.listen}:
 * ```typescript
 * import { getCurrentWindow } from "@tauri-apps/api/window";
 * getCurrentWindow().listen("my-window-event", ({ event, payload }) => { });
 * ```
 *
 * @module
 */
/**
 * Attention type to request on a window.
 *
 * @since 1.0.0
 */
var UserAttentionType;
(function (UserAttentionType) {
    /**
     * #### Platform-specific
     * - **macOS:** Bounces the dock icon until the application is in focus.
     * - **Windows:** Flashes both the window and the taskbar button until the application is in focus.
     */
    UserAttentionType[UserAttentionType["Critical"] = 1] = "Critical";
    /**
     * #### Platform-specific
     * - **macOS:** Bounces the dock icon once.
     * - **Windows:** Flashes the taskbar button until the application is in focus.
     */
    UserAttentionType[UserAttentionType["Informational"] = 2] = "Informational";
})(UserAttentionType || (UserAttentionType = {}));
class CloseRequestedEvent {
    constructor(event) {
        this._preventDefault = false;
        this.event = event.event;
        this.id = event.id;
    }
    preventDefault() {
        this._preventDefault = true;
    }
    isPreventDefault() {
        return this._preventDefault;
    }
}
var ProgressBarStatus;
(function (ProgressBarStatus) {
    /**
     * Hide progress bar.
     */
    ProgressBarStatus["None"] = "none";
    /**
     * Normal state.
     */
    ProgressBarStatus["Normal"] = "normal";
    /**
     * Indeterminate state. **Treated as Normal on Linux and macOS**
     */
    ProgressBarStatus["Indeterminate"] = "indeterminate";
    /**
     * Paused state. **Treated as Normal on Linux**
     */
    ProgressBarStatus["Paused"] = "paused";
    /**
     * Error state. **Treated as Normal on linux**
     */
    ProgressBarStatus["Error"] = "error";
})(ProgressBarStatus || (ProgressBarStatus = {}));
/**
 * Get an instance of `Window` for the current window.
 *
 * @since 1.0.0
 */
function getCurrentWindow() {
    return new Window(window.__TAURI_INTERNALS__.metadata.currentWindow.label, {
        // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
        skip: true
    });
}
/**
 * Gets a list of instances of `Window` for all available windows.
 *
 * @since 1.0.0
 */
async function getAllWindows() {
    return invoke('plugin:window|get_all_windows').then((windows) => windows.map((w) => new Window(w, {
        // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
        skip: true
    })));
}
/** @ignore */
// events that are emitted right here instead of by the created window
const localTauriEvents$1 = ['tauri://created', 'tauri://error'];
/**
 * Create new window or get a handle to an existing one.
 *
 * Windows are identified by a *label*  a unique identifier that can be used to reference it later.
 * It may only contain alphanumeric characters `a-zA-Z` plus the following special characters `-`, `/`, `:` and `_`.
 *
 * @example
 * ```typescript
 * import { Window } from "@tauri-apps/api/window"
 *
 * const appWindow = new Window('theUniqueLabel');
 *
 * appWindow.once('tauri://created', function () {
 *  // window successfully created
 * });
 * appWindow.once('tauri://error', function (e) {
 *  // an error happened creating the window
 * });
 *
 * // emit an event to the backend
 * await appWindow.emit("some-event", "data");
 * // listen to an event from the backend
 * const unlisten = await appWindow.listen("event-name", e => {});
 * unlisten();
 * ```
 *
 * @since 2.0.0
 */
class Window {
    /**
     * Creates a new Window.
     * @example
     * ```typescript
     * import { Window } from '@tauri-apps/api/window';
     * const appWindow = new Window('my-label');
     * appWindow.once('tauri://created', function () {
     *  // window successfully created
     * });
     * appWindow.once('tauri://error', function (e) {
     *  // an error happened creating the window
     * });
     * ```
     *
     * @param label The unique window label. Must be alphanumeric: `a-zA-Z-/:_`.
     * @returns The {@link Window} instance to communicate with the window.
     */
    constructor(label, options = {}) {
        var _a;
        this.label = label;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.listeners = Object.create(null);
        // @ts-expect-error `skip` is not a public API so it is not defined in WindowOptions
        if (!(options === null || options === void 0 ? void 0 : options.skip)) {
            invoke('plugin:window|create', {
                options: {
                    ...options,
                    parent: typeof options.parent === 'string'
                        ? options.parent
                        : (_a = options.parent) === null || _a === void 0 ? void 0 : _a.label,
                    label
                }
            })
                .then(async () => this.emit('tauri://created'))
                .catch(async (e) => this.emit('tauri://error', e));
        }
    }
    /**
     * Gets the Window associated with the given label.
     * @example
     * ```typescript
     * import { Window } from '@tauri-apps/api/window';
     * const mainWindow = Window.getByLabel('main');
     * ```
     *
     * @param label The window label.
     * @returns The Window instance to communicate with the window or null if the window doesn't exist.
     */
    static async getByLabel(label) {
        var _a;
        return (_a = (await getAllWindows()).find((w) => w.label === label)) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Get an instance of `Window` for the current window.
     */
    static getCurrent() {
        return getCurrentWindow();
    }
    /**
     * Gets a list of instances of `Window` for all available windows.
     */
    static async getAll() {
        return getAllWindows();
    }
    /**
     *  Gets the focused window.
     * @example
     * ```typescript
     * import { Window } from '@tauri-apps/api/window';
     * const focusedWindow = Window.getFocusedWindow();
     * ```
     *
     * @returns The Window instance or `undefined` if there is not any focused window.
     */
    static async getFocusedWindow() {
        for (const w of await getAllWindows()) {
            if (await w.isFocused()) {
                return w;
            }
        }
        return null;
    }
    /**
     * Listen to an emitted event on this window.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const unlisten = await getCurrentWindow().listen<string>('state-changed', (event) => {
     *   console.log(`Got error: ${payload}`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async listen(event, handler) {
        if (this._handleTauriEvent(event, handler)) {
            return () => {
                // eslint-disable-next-line security/detect-object-injection
                const listeners = this.listeners[event];
                listeners.splice(listeners.indexOf(handler), 1);
            };
        }
        return listen(event, handler, {
            target: { kind: 'Window', label: this.label }
        });
    }
    /**
     * Listen to an emitted event on this window only once.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const unlisten = await getCurrentWindow().once<null>('initialized', (event) => {
     *   console.log(`Window initialized!`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async once(event, handler) {
        if (this._handleTauriEvent(event, handler)) {
            return () => {
                // eslint-disable-next-line security/detect-object-injection
                const listeners = this.listeners[event];
                listeners.splice(listeners.indexOf(handler), 1);
            };
        }
        return once(event, handler, {
            target: { kind: 'Window', label: this.label }
        });
    }
    /**
     * Emits an event to all {@link EventTarget|targets}.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().emit('window-loaded', { loggedIn: true, token: 'authToken' });
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param payload Event payload.
     */
    async emit(event, payload) {
        if (localTauriEvents$1.includes(event)) {
            // eslint-disable-next-line
            for (const handler of this.listeners[event] || []) {
                handler({
                    event,
                    id: -1,
                    payload
                });
            }
            return;
        }
        return emit(event, payload);
    }
    /**
     * Emits an event to all {@link EventTarget|targets} matching the given target.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().emit('main', 'window-loaded', { loggedIn: true, token: 'authToken' });
     * ```
     * @param target Label of the target Window/Webview/WebviewWindow or raw {@link EventTarget} object.
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param payload Event payload.
     */
    async emitTo(target, event, payload) {
        if (localTauriEvents$1.includes(event)) {
            // eslint-disable-next-line security/detect-object-injection
            for (const handler of this.listeners[event] || []) {
                handler({
                    event,
                    id: -1,
                    payload
                });
            }
            return;
        }
        return emitTo(target, event, payload);
    }
    /** @ignore */
    _handleTauriEvent(event, handler) {
        if (localTauriEvents$1.includes(event)) {
            if (!(event in this.listeners)) {
                // eslint-disable-next-line
                this.listeners[event] = [handler];
            }
            else {
                // eslint-disable-next-line
                this.listeners[event].push(handler);
            }
            return true;
        }
        return false;
    }
    // Getters
    /**
     * The scale factor that can be used to map physical pixels to logical pixels.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const factor = await getCurrentWindow().scaleFactor();
     * ```
     *
     * @returns The window's monitor scale factor.
     */
    async scaleFactor() {
        return invoke('plugin:window|scale_factor', {
            label: this.label
        });
    }
    /**
     * The position of the top-left hand corner of the window's client area relative to the top-left hand corner of the desktop.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const position = await getCurrentWindow().innerPosition();
     * ```
     *
     * @returns The window's inner position.
     */
    async innerPosition() {
        return invoke('plugin:window|inner_position', {
            label: this.label
        }).then((p) => new PhysicalPosition(p));
    }
    /**
     * The position of the top-left hand corner of the window relative to the top-left hand corner of the desktop.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const position = await getCurrentWindow().outerPosition();
     * ```
     *
     * @returns The window's outer position.
     */
    async outerPosition() {
        return invoke('plugin:window|outer_position', {
            label: this.label
        }).then((p) => new PhysicalPosition(p));
    }
    /**
     * The physical size of the window's client area.
     * The client area is the content of the window, excluding the title bar and borders.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const size = await getCurrentWindow().innerSize();
     * ```
     *
     * @returns The window's inner size.
     */
    async innerSize() {
        return invoke('plugin:window|inner_size', {
            label: this.label
        }).then((s) => new PhysicalSize(s));
    }
    /**
     * The physical size of the entire window.
     * These dimensions include the title bar and borders. If you don't want that (and you usually don't), use inner_size instead.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const size = await getCurrentWindow().outerSize();
     * ```
     *
     * @returns The window's outer size.
     */
    async outerSize() {
        return invoke('plugin:window|outer_size', {
            label: this.label
        }).then((s) => new PhysicalSize(s));
    }
    /**
     * Gets the window's current fullscreen state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const fullscreen = await getCurrentWindow().isFullscreen();
     * ```
     *
     * @returns Whether the window is in fullscreen mode or not.
     */
    async isFullscreen() {
        return invoke('plugin:window|is_fullscreen', {
            label: this.label
        });
    }
    /**
     * Gets the window's current minimized state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const minimized = await getCurrentWindow().isMinimized();
     * ```
     */
    async isMinimized() {
        return invoke('plugin:window|is_minimized', {
            label: this.label
        });
    }
    /**
     * Gets the window's current maximized state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const maximized = await getCurrentWindow().isMaximized();
     * ```
     *
     * @returns Whether the window is maximized or not.
     */
    async isMaximized() {
        return invoke('plugin:window|is_maximized', {
            label: this.label
        });
    }
    /**
     * Gets the window's current focus state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const focused = await getCurrentWindow().isFocused();
     * ```
     *
     * @returns Whether the window is focused or not.
     */
    async isFocused() {
        return invoke('plugin:window|is_focused', {
            label: this.label
        });
    }
    /**
     * Gets the window's current decorated state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const decorated = await getCurrentWindow().isDecorated();
     * ```
     *
     * @returns Whether the window is decorated or not.
     */
    async isDecorated() {
        return invoke('plugin:window|is_decorated', {
            label: this.label
        });
    }
    /**
     * Gets the window's current resizable state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const resizable = await getCurrentWindow().isResizable();
     * ```
     *
     * @returns Whether the window is resizable or not.
     */
    async isResizable() {
        return invoke('plugin:window|is_resizable', {
            label: this.label
        });
    }
    /**
     * Gets the window's native maximize button state.
     *
     * #### Platform-specific
     *
     * - **Linux / iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const maximizable = await getCurrentWindow().isMaximizable();
     * ```
     *
     * @returns Whether the window's native maximize button is enabled or not.
     */
    async isMaximizable() {
        return invoke('plugin:window|is_maximizable', {
            label: this.label
        });
    }
    /**
     * Gets the window's native minimize button state.
     *
     * #### Platform-specific
     *
     * - **Linux / iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const minimizable = await getCurrentWindow().isMinimizable();
     * ```
     *
     * @returns Whether the window's native minimize button is enabled or not.
     */
    async isMinimizable() {
        return invoke('plugin:window|is_minimizable', {
            label: this.label
        });
    }
    /**
     * Gets the window's native close button state.
     *
     * #### Platform-specific
     *
     * - **iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const closable = await getCurrentWindow().isClosable();
     * ```
     *
     * @returns Whether the window's native close button is enabled or not.
     */
    async isClosable() {
        return invoke('plugin:window|is_closable', {
            label: this.label
        });
    }
    /**
     * Gets the window's current visible state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const visible = await getCurrentWindow().isVisible();
     * ```
     *
     * @returns Whether the window is visible or not.
     */
    async isVisible() {
        return invoke('plugin:window|is_visible', {
            label: this.label
        });
    }
    /**
     * Gets the window's current title.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const title = await getCurrentWindow().title();
     * ```
     */
    async title() {
        return invoke('plugin:window|title', {
            label: this.label
        });
    }
    /**
     * Gets the window's current theme.
     *
     * #### Platform-specific
     *
     * - **macOS:** Theme was introduced on macOS 10.14. Returns `light` on macOS 10.13 and below.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * const theme = await getCurrentWindow().theme();
     * ```
     *
     * @returns The window theme.
     */
    async theme() {
        return invoke('plugin:window|theme', {
            label: this.label
        });
    }
    // Setters
    /**
     * Centers the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().center();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async center() {
        return invoke('plugin:window|center', {
            label: this.label
        });
    }
    /**
     *  Requests user attention to the window, this has no effect if the application
     * is already focused. How requesting for user attention manifests is platform dependent,
     * see `UserAttentionType` for details.
     *
     * Providing `null` will unset the request for user attention. Unsetting the request for
     * user attention might not be done automatically by the WM when the window receives input.
     *
     * #### Platform-specific
     *
     * - **macOS:** `null` has no effect.
     * - **Linux:** Urgency levels have the same effect.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().requestUserAttention();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async requestUserAttention(requestType) {
        let requestType_ = null;
        if (requestType) {
            if (requestType === UserAttentionType.Critical) {
                requestType_ = { type: 'Critical' };
            }
            else {
                requestType_ = { type: 'Informational' };
            }
        }
        return invoke('plugin:window|request_user_attention', {
            label: this.label,
            value: requestType_
        });
    }
    /**
     * Updates the window resizable flag.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setResizable(false);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setResizable(resizable) {
        return invoke('plugin:window|set_resizable', {
            label: this.label,
            value: resizable
        });
    }
    /**
     * Enable or disable the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setEnabled(false);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    async setEnabled(enabled) {
        return invoke('plugin:window|set_enabled', {
            label: this.label,
            value: enabled
        });
    }
    /**
     * Whether the window is enabled or disabled.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setEnabled(false);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    async isEnabled() {
        return invoke('plugin:window|is_enabled', {
            label: this.label
        });
    }
    /**
     * Sets whether the window's native maximize button is enabled or not.
     * If resizable is set to false, this setting is ignored.
     *
     * #### Platform-specific
     *
     * - **macOS:** Disables the "zoom" button in the window titlebar, which is also used to enter fullscreen mode.
     * - **Linux / iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setMaximizable(false);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setMaximizable(maximizable) {
        return invoke('plugin:window|set_maximizable', {
            label: this.label,
            value: maximizable
        });
    }
    /**
     * Sets whether the window's native minimize button is enabled or not.
     *
     * #### Platform-specific
     *
     * - **Linux / iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setMinimizable(false);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setMinimizable(minimizable) {
        return invoke('plugin:window|set_minimizable', {
            label: this.label,
            value: minimizable
        });
    }
    /**
     * Sets whether the window's native close button is enabled or not.
     *
     * #### Platform-specific
     *
     * - **Linux:** GTK+ will do its best to convince the window manager not to show a close button. Depending on the system, this function may not have any effect when called on a window that is already visible
     * - **iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setClosable(false);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setClosable(closable) {
        return invoke('plugin:window|set_closable', {
            label: this.label,
            value: closable
        });
    }
    /**
     * Sets the window title.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setTitle('Tauri');
     * ```
     *
     * @param title The new title
     * @returns A promise indicating the success or failure of the operation.
     */
    async setTitle(title) {
        return invoke('plugin:window|set_title', {
            label: this.label,
            value: title
        });
    }
    /**
     * Maximizes the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().maximize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async maximize() {
        return invoke('plugin:window|maximize', {
            label: this.label
        });
    }
    /**
     * Unmaximizes the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().unmaximize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async unmaximize() {
        return invoke('plugin:window|unmaximize', {
            label: this.label
        });
    }
    /**
     * Toggles the window maximized state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().toggleMaximize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async toggleMaximize() {
        return invoke('plugin:window|toggle_maximize', {
            label: this.label
        });
    }
    /**
     * Minimizes the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().minimize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async minimize() {
        return invoke('plugin:window|minimize', {
            label: this.label
        });
    }
    /**
     * Unminimizes the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().unminimize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async unminimize() {
        return invoke('plugin:window|unminimize', {
            label: this.label
        });
    }
    /**
     * Sets the window visibility to true.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().show();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async show() {
        return invoke('plugin:window|show', {
            label: this.label
        });
    }
    /**
     * Sets the window visibility to false.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().hide();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async hide() {
        return invoke('plugin:window|hide', {
            label: this.label
        });
    }
    /**
     * Closes the window.
     *
     * Note this emits a closeRequested event so you can intercept it. To force window close, use {@link Window.destroy}.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().close();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async close() {
        return invoke('plugin:window|close', {
            label: this.label
        });
    }
    /**
     * Destroys the window. Behaves like {@link Window.close} but forces the window close instead of emitting a closeRequested event.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().destroy();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async destroy() {
        return invoke('plugin:window|destroy', {
            label: this.label
        });
    }
    /**
     * Whether the window should have borders and bars.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setDecorations(false);
     * ```
     *
     * @param decorations Whether the window should have borders and bars.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setDecorations(decorations) {
        return invoke('plugin:window|set_decorations', {
            label: this.label,
            value: decorations
        });
    }
    /**
     * Whether or not the window should have shadow.
     *
     * #### Platform-specific
     *
     * - **Windows:**
     *   - `false` has no effect on decorated window, shadows are always ON.
     *   - `true` will make undecorated window have a 1px white border,
     * and on Windows 11, it will have a rounded corners.
     * - **Linux:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setShadow(false);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setShadow(enable) {
        return invoke('plugin:window|set_shadow', {
            label: this.label,
            value: enable
        });
    }
    /**
     * Set window effects.
     */
    async setEffects(effects) {
        return invoke('plugin:window|set_effects', {
            label: this.label,
            value: effects
        });
    }
    /**
     * Clear any applied effects if possible.
     */
    async clearEffects() {
        return invoke('plugin:window|set_effects', {
            label: this.label,
            value: null
        });
    }
    /**
     * Whether the window should always be on top of other windows.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setAlwaysOnTop(true);
     * ```
     *
     * @param alwaysOnTop Whether the window should always be on top of other windows or not.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setAlwaysOnTop(alwaysOnTop) {
        return invoke('plugin:window|set_always_on_top', {
            label: this.label,
            value: alwaysOnTop
        });
    }
    /**
     * Whether the window should always be below other windows.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setAlwaysOnBottom(true);
     * ```
     *
     * @param alwaysOnBottom Whether the window should always be below other windows or not.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setAlwaysOnBottom(alwaysOnBottom) {
        return invoke('plugin:window|set_always_on_bottom', {
            label: this.label,
            value: alwaysOnBottom
        });
    }
    /**
     * Prevents the window contents from being captured by other apps.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setContentProtected(true);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setContentProtected(protected_) {
        return invoke('plugin:window|set_content_protected', {
            label: this.label,
            value: protected_
        });
    }
    /**
     * Resizes the window with a new inner size.
     * @example
     * ```typescript
     * import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
     * await getCurrentWindow().setSize(new LogicalSize(600, 500));
     * ```
     *
     * @param size The logical or physical inner size.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setSize(size) {
        return invoke('plugin:window|set_size', {
            label: this.label,
            value: size instanceof Size ? size : new Size(size)
        });
    }
    /**
     * Sets the window minimum inner size. If the `size` argument is not provided, the constraint is unset.
     * @example
     * ```typescript
     * import { getCurrentWindow, PhysicalSize } from '@tauri-apps/api/window';
     * await getCurrentWindow().setMinSize(new PhysicalSize(600, 500));
     * ```
     *
     * @param size The logical or physical inner size, or `null` to unset the constraint.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setMinSize(size) {
        return invoke('plugin:window|set_min_size', {
            label: this.label,
            value: size instanceof Size ? size : size ? new Size(size) : null
        });
    }
    /**
     * Sets the window maximum inner size. If the `size` argument is undefined, the constraint is unset.
     * @example
     * ```typescript
     * import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
     * await getCurrentWindow().setMaxSize(new LogicalSize(600, 500));
     * ```
     *
     * @param size The logical or physical inner size, or `null` to unset the constraint.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setMaxSize(size) {
        return invoke('plugin:window|set_max_size', {
            label: this.label,
            value: size instanceof Size ? size : size ? new Size(size) : null
        });
    }
    /**
     * Sets the window inner size constraints.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setSizeConstraints({ minWidth: 300 });
     * ```
     *
     * @param constraints The logical or physical inner size, or `null` to unset the constraint.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setSizeConstraints(constraints) {
        function logical(pixel) {
            return pixel ? { Logical: pixel } : null;
        }
        return invoke('plugin:window|set_size_constraints', {
            label: this.label,
            value: {
                minWidth: logical(constraints === null || constraints === void 0 ? void 0 : constraints.minWidth),
                minHeight: logical(constraints === null || constraints === void 0 ? void 0 : constraints.minHeight),
                maxWidth: logical(constraints === null || constraints === void 0 ? void 0 : constraints.maxWidth),
                maxHeight: logical(constraints === null || constraints === void 0 ? void 0 : constraints.maxHeight)
            }
        });
    }
    /**
     * Sets the window outer position.
     * @example
     * ```typescript
     * import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
     * await getCurrentWindow().setPosition(new LogicalPosition(600, 500));
     * ```
     *
     * @param position The new position, in logical or physical pixels.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setPosition(position) {
        return invoke('plugin:window|set_position', {
            label: this.label,
            value: position instanceof Position ? position : new Position(position)
        });
    }
    /**
     * Sets the window fullscreen state.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setFullscreen(true);
     * ```
     *
     * @param fullscreen Whether the window should go to fullscreen or not.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setFullscreen(fullscreen) {
        return invoke('plugin:window|set_fullscreen', {
            label: this.label,
            value: fullscreen
        });
    }
    /**
     * Bring the window to front and focus.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setFocus();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setFocus() {
        return invoke('plugin:window|set_focus', {
            label: this.label
        });
    }
    /**
     * Sets the window icon.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setIcon('/tauri/awesome.png');
     * ```
     *
     * Note that you may need the `image-ico` or `image-png` Cargo features to use this API.
     * To enable it, change your Cargo.toml file:
     * ```toml
     * [dependencies]
     * tauri = { version = "...", features = ["...", "image-png"] }
     * ```
     *
     * @param icon Icon bytes or path to the icon file.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setIcon(icon) {
        return invoke('plugin:window|set_icon', {
            label: this.label,
            value: transformImage(icon)
        });
    }
    /**
     * Whether the window icon should be hidden from the taskbar or not.
     *
     * #### Platform-specific
     *
     * - **macOS:** Unsupported.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setSkipTaskbar(true);
     * ```
     *
     * @param skip true to hide window icon, false to show it.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setSkipTaskbar(skip) {
        return invoke('plugin:window|set_skip_taskbar', {
            label: this.label,
            value: skip
        });
    }
    /**
     * Grabs the cursor, preventing it from leaving the window.
     *
     * There's no guarantee that the cursor will be hidden. You should
     * hide it by yourself if you want so.
     *
     * #### Platform-specific
     *
     * - **Linux:** Unsupported.
     * - **macOS:** This locks the cursor in a fixed location, which looks visually awkward.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setCursorGrab(true);
     * ```
     *
     * @param grab `true` to grab the cursor icon, `false` to release it.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setCursorGrab(grab) {
        return invoke('plugin:window|set_cursor_grab', {
            label: this.label,
            value: grab
        });
    }
    /**
     * Modifies the cursor's visibility.
     *
     * #### Platform-specific
     *
     * - **Windows:** The cursor is only hidden within the confines of the window.
     * - **macOS:** The cursor is hidden as long as the window has input focus, even if the cursor is
     *   outside of the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setCursorVisible(false);
     * ```
     *
     * @param visible If `false`, this will hide the cursor. If `true`, this will show the cursor.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setCursorVisible(visible) {
        return invoke('plugin:window|set_cursor_visible', {
            label: this.label,
            value: visible
        });
    }
    /**
     * Modifies the cursor icon of the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setCursorIcon('help');
     * ```
     *
     * @param icon The new cursor icon.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setCursorIcon(icon) {
        return invoke('plugin:window|set_cursor_icon', {
            label: this.label,
            value: icon
        });
    }
    /**
     * Sets the window background color.
     *
     * #### Platform-specific:
     *
     * - **Windows:** alpha channel is ignored.
     * - **iOS / Android:** Unsupported.
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.1.0
     */
    async setBackgroundColor(color) {
        return invoke('plugin:window|set_background_color', { color });
    }
    /**
     * Changes the position of the cursor in window coordinates.
     * @example
     * ```typescript
     * import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
     * await getCurrentWindow().setCursorPosition(new LogicalPosition(600, 300));
     * ```
     *
     * @param position The new cursor position.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setCursorPosition(position) {
        return invoke('plugin:window|set_cursor_position', {
            label: this.label,
            value: position instanceof Position ? position : new Position(position)
        });
    }
    /**
     * Changes the cursor events behavior.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().setIgnoreCursorEvents(true);
     * ```
     *
     * @param ignore `true` to ignore the cursor events; `false` to process them as usual.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setIgnoreCursorEvents(ignore) {
        return invoke('plugin:window|set_ignore_cursor_events', {
            label: this.label,
            value: ignore
        });
    }
    /**
     * Starts dragging the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().startDragging();
     * ```
     *
     * @return A promise indicating the success or failure of the operation.
     */
    async startDragging() {
        return invoke('plugin:window|start_dragging', {
            label: this.label
        });
    }
    /**
     * Starts resize-dragging the window.
     * @example
     * ```typescript
     * import { getCurrentWindow } from '@tauri-apps/api/window';
     * await getCurrentWindow().startResizeDragging();
     * ```
     *
     * @return A promise indicating the success or failure of the operation.
     */
    async startResizeDragging(direction) {
        return invoke('plugin:window|start_resize_dragging', {
            label: this.label,
            value: direction
        });
    }
    /**
     * Sets the taskbar progress state.
     *
     * #### Platform-specific
     *
     * - **Linux / macOS**: Progress bar is app-wide and not specific to this window.
     * - **Linux**: Only supported desktop environments with `libunity` (e.g. GNOME).
     *
     * @example
     * ```typescript
     * import { getCurrentWindow, ProgressBarStatus } from '@tauri-apps/api/window';
     * await getCurrentWindow().setProgressBar({
     *   status: ProgressBarStatus.Normal,
     *   progress: 50,
     * });
     * ```
     *
     * @return A promise indicating the success or failure of the operation.
     */
    async setProgressBar(state) {
        return invoke('plugin:window|set_progress_bar', {
            label: this.label,
            value: state
        });
    }
    /**
     * Sets whether the window should be visible on all workspaces or virtual desktops.
     *
     * #### Platform-specific
     *
     * - **Windows / iOS / Android:** Unsupported.
     *
     * @since 2.0.0
     */
    async setVisibleOnAllWorkspaces(visible) {
        return invoke('plugin:window|set_visible_on_all_workspaces', {
            label: this.label,
            value: visible
        });
    }
    /**
     * Sets the title bar style. **macOS only**.
     *
     * @since 2.0.0
     */
    async setTitleBarStyle(style) {
        return invoke('plugin:window|set_title_bar_style', {
            label: this.label,
            value: style
        });
    }
    /**
     * Set window theme, pass in `null` or `undefined` to follow system theme
     *
     * #### Platform-specific
     *
     * - **Linux / macOS**: Theme is app-wide and not specific to this window.
     * - **iOS / Android:** Unsupported.
     *
     * @since 2.0.0
     */
    async setTheme(theme) {
        return invoke('plugin:window|set_theme', {
            label: this.label,
            value: theme
        });
    }
    // Listeners
    /**
     * Listen to window resize.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from "@tauri-apps/api/window";
     * const unlisten = await getCurrentWindow().onResized(({ payload: size }) => {
     *  console.log('Window resized', size);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async onResized(handler) {
        return this.listen(TauriEvent.WINDOW_RESIZED, (e) => {
            e.payload = new PhysicalSize(e.payload);
            handler(e);
        });
    }
    /**
     * Listen to window move.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from "@tauri-apps/api/window";
     * const unlisten = await getCurrentWindow().onMoved(({ payload: position }) => {
     *  console.log('Window moved', position);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async onMoved(handler) {
        return this.listen(TauriEvent.WINDOW_MOVED, (e) => {
            e.payload = new PhysicalPosition(e.payload);
            handler(e);
        });
    }
    /**
     * Listen to window close requested. Emitted when the user requests to closes the window.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from "@tauri-apps/api/window";
     * import { confirm } from '@tauri-apps/api/dialog';
     * const unlisten = await getCurrentWindow().onCloseRequested(async (event) => {
     *   const confirmed = await confirm('Are you sure?');
     *   if (!confirmed) {
     *     // user did not confirm closing the window; let's prevent it
     *     event.preventDefault();
     *   }
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async onCloseRequested(handler) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        return this.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async (event) => {
            const evt = new CloseRequestedEvent(event);
            await handler(evt);
            if (!evt.isPreventDefault()) {
                await this.destroy();
            }
        });
    }
    /**
     * Listen to a file drop event.
     * The listener is triggered when the user hovers the selected files on the webview,
     * drops the files or cancels the operation.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from "@tauri-apps/api/webview";
     * const unlisten = await getCurrentWindow().onDragDropEvent((event) => {
     *  if (event.payload.type === 'over') {
     *    console.log('User hovering', event.payload.paths);
     *  } else if (event.payload.type === 'drop') {
     *    console.log('User dropped', event.payload.paths);
     *  } else {
     *    console.log('File drop cancelled');
     *  }
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async onDragDropEvent(handler) {
        const unlistenDrag = await this.listen(TauriEvent.DRAG_ENTER, (event) => {
            handler({
                ...event,
                payload: {
                    type: 'enter',
                    paths: event.payload.paths,
                    position: new PhysicalPosition(event.payload.position)
                }
            });
        });
        const unlistenDragOver = await this.listen(TauriEvent.DRAG_OVER, (event) => {
            handler({
                ...event,
                payload: {
                    type: 'over',
                    position: new PhysicalPosition(event.payload.position)
                }
            });
        });
        const unlistenDrop = await this.listen(TauriEvent.DRAG_DROP, (event) => {
            handler({
                ...event,
                payload: {
                    type: 'drop',
                    paths: event.payload.paths,
                    position: new PhysicalPosition(event.payload.position)
                }
            });
        });
        const unlistenCancel = await this.listen(TauriEvent.DRAG_LEAVE, (event) => {
            handler({ ...event, payload: { type: 'leave' } });
        });
        return () => {
            unlistenDrag();
            unlistenDrop();
            unlistenDragOver();
            unlistenCancel();
        };
    }
    /**
     * Listen to window focus change.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from "@tauri-apps/api/window";
     * const unlisten = await getCurrentWindow().onFocusChanged(({ payload: focused }) => {
     *  console.log('Focus changed, window is focused? ' + focused);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async onFocusChanged(handler) {
        const unlistenFocus = await this.listen(TauriEvent.WINDOW_FOCUS, (event) => {
            handler({ ...event, payload: true });
        });
        const unlistenBlur = await this.listen(TauriEvent.WINDOW_BLUR, (event) => {
            handler({ ...event, payload: false });
        });
        return () => {
            unlistenFocus();
            unlistenBlur();
        };
    }
    /**
     * Listen to window scale change. Emitted when the window's scale factor has changed.
     * The following user actions can cause DPI changes:
     * - Changing the display's resolution.
     * - Changing the display's scale factor (e.g. in Control Panel on Windows).
     * - Moving the window to a display with a different scale factor.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from "@tauri-apps/api/window";
     * const unlisten = await getCurrentWindow().onScaleChanged(({ payload }) => {
     *  console.log('Scale changed', payload.scaleFactor, payload.size);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async onScaleChanged(handler) {
        return this.listen(TauriEvent.WINDOW_SCALE_FACTOR_CHANGED, handler);
    }
    /**
     * Listen to the system theme change.
     *
     * @example
     * ```typescript
     * import { getCurrentWindow } from "@tauri-apps/api/window";
     * const unlisten = await getCurrentWindow().onThemeChanged(({ payload: theme }) => {
     *  console.log('New theme: ' + theme);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async onThemeChanged(handler) {
        return this.listen(TauriEvent.WINDOW_THEME_CHANGED, handler);
    }
}
/**
 * Platform-specific window effects
 *
 * @since 2.0.0
 */
var Effect;
(function (Effect) {
    /**
     * A default material appropriate for the view's effectiveAppearance.  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. You should instead choose an appropriate semantic material.
     */
    Effect["AppearanceBased"] = "appearanceBased";
    /**
     *  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. Use a semantic material instead.
     */
    Effect["Light"] = "light";
    /**
     *  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. Use a semantic material instead.
     */
    Effect["Dark"] = "dark";
    /**
     *  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. Use a semantic material instead.
     */
    Effect["MediumLight"] = "mediumLight";
    /**
     *  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. Use a semantic material instead.
     */
    Effect["UltraDark"] = "ultraDark";
    /**
     *  **macOS 10.10+**
     */
    Effect["Titlebar"] = "titlebar";
    /**
     *  **macOS 10.10+**
     */
    Effect["Selection"] = "selection";
    /**
     *  **macOS 10.11+**
     */
    Effect["Menu"] = "menu";
    /**
     *  **macOS 10.11+**
     */
    Effect["Popover"] = "popover";
    /**
     *  **macOS 10.11+**
     */
    Effect["Sidebar"] = "sidebar";
    /**
     *  **macOS 10.14+**
     */
    Effect["HeaderView"] = "headerView";
    /**
     *  **macOS 10.14+**
     */
    Effect["Sheet"] = "sheet";
    /**
     *  **macOS 10.14+**
     */
    Effect["WindowBackground"] = "windowBackground";
    /**
     *  **macOS 10.14+**
     */
    Effect["HudWindow"] = "hudWindow";
    /**
     *  **macOS 10.14+**
     */
    Effect["FullScreenUI"] = "fullScreenUI";
    /**
     *  **macOS 10.14+**
     */
    Effect["Tooltip"] = "tooltip";
    /**
     *  **macOS 10.14+**
     */
    Effect["ContentBackground"] = "contentBackground";
    /**
     *  **macOS 10.14+**
     */
    Effect["UnderWindowBackground"] = "underWindowBackground";
    /**
     *  **macOS 10.14+**
     */
    Effect["UnderPageBackground"] = "underPageBackground";
    /**
     *  **Windows 11 Only**
     */
    Effect["Mica"] = "mica";
    /**
     * **Windows 7/10/11(22H1) Only**
     *
     * #### Notes
     *
     * This effect has bad performance when resizing/dragging the window on Windows 11 build 22621.
     */
    Effect["Blur"] = "blur";
    /**
     * **Windows 10/11**
     *
     * #### Notes
     *
     * This effect has bad performance when resizing/dragging the window on Windows 10 v1903+ and Windows 11 build 22000.
     */
    Effect["Acrylic"] = "acrylic";
    /**
     * Tabbed effect that matches the system dark perefence **Windows 11 Only**
     */
    Effect["Tabbed"] = "tabbed";
    /**
     * Tabbed effect with dark mode but only if dark mode is enabled on the system **Windows 11 Only**
     */
    Effect["TabbedDark"] = "tabbedDark";
    /**
     * Tabbed effect with light mode **Windows 11 Only**
     */
    Effect["TabbedLight"] = "tabbedLight";
})(Effect || (Effect = {}));
/**
 * Window effect state **macOS only**
 *
 * @see https://developer.apple.com/documentation/appkit/nsvisualeffectview/state
 *
 * @since 2.0.0
 */
var EffectState;
(function (EffectState) {
    /**
     *  Make window effect state follow the window's active state **macOS only**
     */
    EffectState["FollowsWindowActiveState"] = "followsWindowActiveState";
    /**
     *  Make window effect state always active **macOS only**
     */
    EffectState["Active"] = "active";
    /**
     *  Make window effect state always inactive **macOS only**
     */
    EffectState["Inactive"] = "inactive";
})(EffectState || (EffectState = {}));

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Provides APIs to create webviews, communicate with other webviews and manipulate the current webview.
 *
 * #### Webview events
 *
 * Events can be listened to using {@link Webview.listen}:
 * ```typescript
 * import { getCurrentWebview } from "@tauri-apps/api/webview";
 * getCurrentWebview().listen("my-webview-event", ({ event, payload }) => { });
 * ```
 *
 * @module
 */
/**
 * Get an instance of `Webview` for the current webview.
 *
 * @since 2.0.0
 */
function getCurrentWebview() {
    return new Webview(getCurrentWindow(), window.__TAURI_INTERNALS__.metadata.currentWebview.label, {
        // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
        skip: true
    });
}
/**
 * Gets a list of instances of `Webview` for all available webviews.
 *
 * @since 2.0.0
 */
async function getAllWebviews() {
    return invoke('plugin:webview|get_all_webviews').then((webviews) => webviews.map((w) => new Webview(new Window(w.windowLabel, {
        // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
        skip: true
    }), w.label, {
        // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
        skip: true
    })));
}
/** @ignore */
// events that are emitted right here instead of by the created webview
const localTauriEvents = ['tauri://created', 'tauri://error'];
/**
 * Create new webview or get a handle to an existing one.
 *
 * Webviews are identified by a *label*  a unique identifier that can be used to reference it later.
 * It may only contain alphanumeric characters `a-zA-Z` plus the following special characters `-`, `/`, `:` and `_`.
 *
 * @example
 * ```typescript
 * import { Window } from "@tauri-apps/api/window"
 * import { Webview } from "@tauri-apps/api/webview"
 *
 * const appWindow = new Window('uniqueLabel');
 *
 * // loading embedded asset:
 * const webview = new Webview(appWindow, 'theUniqueLabel', {
 *   url: 'path/to/page.html'
 * });
 * // alternatively, load a remote URL:
 * const webview = new Webview(appWindow, 'theUniqueLabel', {
 *   url: 'https://github.com/tauri-apps/tauri'
 * });
 *
 * webview.once('tauri://created', function () {
 *  // webview successfully created
 * });
 * webview.once('tauri://error', function (e) {
 *  // an error happened creating the webview
 * });
 *
 * // emit an event to the backend
 * await webview.emit("some-event", "data");
 * // listen to an event from the backend
 * const unlisten = await webview.listen("event-name", e => {});
 * unlisten();
 * ```
 *
 * @since 2.0.0
 */
class Webview {
    /**
     * Creates a new Webview.
     * @example
     * ```typescript
     * import { Window } from '@tauri-apps/api/window'
     * import { Webview } from '@tauri-apps/api/webview'
     * const appWindow = new Window('my-label')
     * const webview = new Webview(appWindow, 'my-label', {
     *   url: 'https://github.com/tauri-apps/tauri'
     * });
     * webview.once('tauri://created', function () {
     *  // webview successfully created
     * });
     * webview.once('tauri://error', function (e) {
     *  // an error happened creating the webview
     * });
     * ```
     *
     * @param window the window to add this webview to.
     * @param label The unique webview label. Must be alphanumeric: `a-zA-Z-/:_`.
     * @returns The {@link Webview} instance to communicate with the webview.
     */
    constructor(window, label, options) {
        this.window = window;
        this.label = label;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.listeners = Object.create(null);
        // @ts-expect-error `skip` is not a public API so it is not defined in WebviewOptions
        if (!(options === null || options === void 0 ? void 0 : options.skip)) {
            invoke('plugin:webview|create_webview', {
                windowLabel: window.label,
                label,
                options
            })
                .then(async () => this.emit('tauri://created'))
                .catch(async (e) => this.emit('tauri://error', e));
        }
    }
    /**
     * Gets the Webview for the webview associated with the given label.
     * @example
     * ```typescript
     * import { Webview } from '@tauri-apps/api/webview';
     * const mainWebview = Webview.getByLabel('main');
     * ```
     *
     * @param label The webview label.
     * @returns The Webview instance to communicate with the webview or null if the webview doesn't exist.
     */
    static async getByLabel(label) {
        var _a;
        return (_a = (await getAllWebviews()).find((w) => w.label === label)) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Get an instance of `Webview` for the current webview.
     */
    static getCurrent() {
        return getCurrentWebview();
    }
    /**
     * Gets a list of instances of `Webview` for all available webviews.
     */
    static async getAll() {
        return getAllWebviews();
    }
    /**
     * Listen to an emitted event on this webview.
     *
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * const unlisten = await getCurrentWebview().listen<string>('state-changed', (event) => {
     *   console.log(`Got error: ${payload}`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async listen(event, handler) {
        if (this._handleTauriEvent(event, handler)) {
            return () => {
                // eslint-disable-next-line security/detect-object-injection
                const listeners = this.listeners[event];
                listeners.splice(listeners.indexOf(handler), 1);
            };
        }
        return listen(event, handler, {
            target: { kind: 'Webview', label: this.label }
        });
    }
    /**
     * Listen to an emitted event on this webview only once.
     *
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * const unlisten = await getCurrent().once<null>('initialized', (event) => {
     *   console.log(`Webview initialized!`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async once(event, handler) {
        if (this._handleTauriEvent(event, handler)) {
            return () => {
                // eslint-disable-next-line security/detect-object-injection
                const listeners = this.listeners[event];
                listeners.splice(listeners.indexOf(handler), 1);
            };
        }
        return once(event, handler, {
            target: { kind: 'Webview', label: this.label }
        });
    }
    /**
     * Emits an event to all {@link EventTarget|targets}.
     *
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().emit('webview-loaded', { loggedIn: true, token: 'authToken' });
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param payload Event payload.
     */
    async emit(event, payload) {
        if (localTauriEvents.includes(event)) {
            // eslint-disable-next-line
            for (const handler of this.listeners[event] || []) {
                handler({
                    event,
                    id: -1,
                    payload
                });
            }
            return;
        }
        return emit(event, payload);
    }
    /**
     * Emits an event to all {@link EventTarget|targets} matching the given target.
     *
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().emitTo('main', 'webview-loaded', { loggedIn: true, token: 'authToken' });
     * ```
     *
     * @param target Label of the target Window/Webview/WebviewWindow or raw {@link EventTarget} object.
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param payload Event payload.
     */
    async emitTo(target, event, payload) {
        if (localTauriEvents.includes(event)) {
            // eslint-disable-next-line
            for (const handler of this.listeners[event] || []) {
                handler({
                    event,
                    id: -1,
                    payload
                });
            }
            return;
        }
        return emitTo(target, event, payload);
    }
    /** @ignore */
    _handleTauriEvent(event, handler) {
        if (localTauriEvents.includes(event)) {
            if (!(event in this.listeners)) {
                // eslint-disable-next-line security/detect-object-injection
                this.listeners[event] = [handler];
            }
            else {
                // eslint-disable-next-line security/detect-object-injection
                this.listeners[event].push(handler);
            }
            return true;
        }
        return false;
    }
    // Getters
    /**
     * The position of the top-left hand corner of the webview's client area relative to the top-left hand corner of the desktop.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * const position = await getCurrentWebview().position();
     * ```
     *
     * @returns The webview's position.
     */
    async position() {
        return invoke('plugin:webview|webview_position', {
            label: this.label
        }).then((p) => new PhysicalPosition(p));
    }
    /**
     * The physical size of the webview's client area.
     * The client area is the content of the webview, excluding the title bar and borders.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * const size = await getCurrentWebview().size();
     * ```
     *
     * @returns The webview's size.
     */
    async size() {
        return invoke('plugin:webview|webview_size', {
            label: this.label
        }).then((s) => new PhysicalSize(s));
    }
    // Setters
    /**
     * Closes the webview.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().close();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async close() {
        return invoke('plugin:webview|close', {
            label: this.label
        });
    }
    /**
     * Resizes the webview.
     * @example
     * ```typescript
     * import { getCurrent, LogicalSize } from '@tauri-apps/api/webview';
     * await getCurrentWebview().setSize(new LogicalSize(600, 500));
     * ```
     *
     * @param size The logical or physical size.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setSize(size) {
        return invoke('plugin:webview|set_webview_size', {
            label: this.label,
            value: size instanceof Size ? size : new Size(size)
        });
    }
    /**
     * Sets the webview position.
     * @example
     * ```typescript
     * import { getCurrent, LogicalPosition } from '@tauri-apps/api/webview';
     * await getCurrentWebview().setPosition(new LogicalPosition(600, 500));
     * ```
     *
     * @param position The new position, in logical or physical pixels.
     * @returns A promise indicating the success or failure of the operation.
     */
    async setPosition(position) {
        return invoke('plugin:webview|set_webview_position', {
            label: this.label,
            value: position instanceof Position ? position : new Position(position)
        });
    }
    /**
     * Bring the webview to front and focus.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().setFocus();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setFocus() {
        return invoke('plugin:webview|set_webview_focus', {
            label: this.label
        });
    }
    /**
     * Hide the webview.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().hide();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async hide() {
        return invoke('plugin:webview|webview_hide', {
            label: this.label
        });
    }
    /**
     * Show the webview.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().show();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async show() {
        return invoke('plugin:webview|webview_show', {
            label: this.label
        });
    }
    /**
     * Set webview zoom level.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().setZoom(1.5);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async setZoom(scaleFactor) {
        return invoke('plugin:webview|set_webview_zoom', {
            label: this.label,
            value: scaleFactor
        });
    }
    /**
     * Moves this webview to the given label.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().reparent('other-window');
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async reparent(window) {
        return invoke('plugin:webview|reparent', {
            label: this.label,
            window: typeof window === 'string' ? window : window.label
        });
    }
    /**
     * Clears all browsing data for this webview.
     * @example
     * ```typescript
     * import { getCurrentWebview } from '@tauri-apps/api/webview';
     * await getCurrentWebview().clearAllBrowsingData();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     */
    async clearAllBrowsingData() {
        return invoke('plugin:webview|clear_all_browsing_data');
    }
    /**
     * Specify the webview background color.
     *
     * #### Platfrom-specific:
     *
     * - **macOS / iOS**: Not implemented.
     * - **Windows**:
     *   - On Windows 7, transparency is not supported and the alpha value will be ignored.
     *   - On Windows higher than 7: translucent colors are not supported so any alpha value other than `0` will be replaced by `255`
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.1.0
     */
    async setBackgroundColor(color) {
        return invoke('plugin:webview|set_webview_background_color', { color });
    }
    // Listeners
    /**
     * Listen to a file drop event.
     * The listener is triggered when the user hovers the selected files on the webview,
     * drops the files or cancels the operation.
     *
     * @example
     * ```typescript
     * import { getCurrentWebview } from "@tauri-apps/api/webview";
     * const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
     *  if (event.payload.type === 'over') {
     *    console.log('User hovering', event.payload.paths);
     *  } else if (event.payload.type === 'drop') {
     *    console.log('User dropped', event.payload.paths);
     *  } else {
     *    console.log('File drop cancelled');
     *  }
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async onDragDropEvent(handler) {
        const unlistenDragEnter = await this.listen(TauriEvent.DRAG_ENTER, (event) => {
            handler({
                ...event,
                payload: {
                    type: 'enter',
                    paths: event.payload.paths,
                    position: new PhysicalPosition(event.payload.position)
                }
            });
        });
        const unlistenDragOver = await this.listen(TauriEvent.DRAG_OVER, (event) => {
            handler({
                ...event,
                payload: {
                    type: 'over',
                    position: new PhysicalPosition(event.payload.position)
                }
            });
        });
        const unlistenDragDrop = await this.listen(TauriEvent.DRAG_DROP, (event) => {
            handler({
                ...event,
                payload: {
                    type: 'drop',
                    paths: event.payload.paths,
                    position: new PhysicalPosition(event.payload.position)
                }
            });
        });
        const unlistenDragLeave = await this.listen(TauriEvent.DRAG_LEAVE, (event) => {
            handler({ ...event, payload: { type: 'leave' } });
        });
        return () => {
            unlistenDragEnter();
            unlistenDragDrop();
            unlistenDragOver();
            unlistenDragLeave();
        };
    }
}

// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Get an instance of `Webview` for the current webview window.
 *
 * @since 2.0.0
 */
function getCurrentWebviewWindow() {
    const webview = getCurrentWebview();
    // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
    return new WebviewWindow(webview.label, { skip: true });
}
/**
 * Gets a list of instances of `Webview` for all available webview windows.
 *
 * @since 2.0.0
 */
async function getAllWebviewWindows() {
    return invoke('plugin:window|get_all_windows').then((windows) => windows.map((w) => new WebviewWindow(w, {
        // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
        skip: true
    })));
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class WebviewWindow {
    /**
     * Creates a new {@link Window} hosting a {@link Webview}.
     * @example
     * ```typescript
     * import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
     * const webview = new WebviewWindow('my-label', {
     *   url: 'https://github.com/tauri-apps/tauri'
     * });
     * webview.once('tauri://created', function () {
     *  // webview successfully created
     * });
     * webview.once('tauri://error', function (e) {
     *  // an error happened creating the webview
     * });
     * ```
     *
     * @param label The unique webview label. Must be alphanumeric: `a-zA-Z-/:_`.
     * @returns The {@link WebviewWindow} instance to communicate with the window and webview.
     */
    constructor(label, options = {}) {
        var _a;
        this.label = label;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.listeners = Object.create(null);
        // @ts-expect-error `skip` is not a public API so it is not defined in WebviewOptions
        if (!(options === null || options === void 0 ? void 0 : options.skip)) {
            invoke('plugin:webview|create_webview_window', {
                options: {
                    ...options,
                    parent: typeof options.parent === 'string'
                        ? options.parent
                        : (_a = options.parent) === null || _a === void 0 ? void 0 : _a.label,
                    label
                }
            })
                .then(async () => this.emit('tauri://created'))
                .catch(async (e) => this.emit('tauri://error', e));
        }
    }
    /**
     * Gets the Webview for the webview associated with the given label.
     * @example
     * ```typescript
     * import { Webview } from '@tauri-apps/api/webviewWindow';
     * const mainWebview = Webview.getByLabel('main');
     * ```
     *
     * @param label The webview label.
     * @returns The Webview instance to communicate with the webview or null if the webview doesn't exist.
     */
    static async getByLabel(label) {
        var _a;
        const webview = (_a = (await getAllWebviewWindows()).find((w) => w.label === label)) !== null && _a !== void 0 ? _a : null;
        if (webview) {
            // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
            return new WebviewWindow(webview.label, { skip: true });
        }
        return null;
    }
    /**
     * Get an instance of `Webview` for the current webview.
     */
    static getCurrent() {
        return getCurrentWebviewWindow();
    }
    /**
     * Gets a list of instances of `Webview` for all available webviews.
     */
    static async getAll() {
        return getAllWebviewWindows();
    }
    /**
     * Listen to an emitted event on this webivew window.
     *
     * @example
     * ```typescript
     * import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
     * const unlisten = await WebviewWindow.getCurrent().listen<string>('state-changed', (event) => {
     *   console.log(`Got error: ${payload}`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async listen(event, handler) {
        if (this._handleTauriEvent(event, handler)) {
            return () => {
                // eslint-disable-next-line security/detect-object-injection
                const listeners = this.listeners[event];
                listeners.splice(listeners.indexOf(handler), 1);
            };
        }
        return listen(event, handler, {
            target: { kind: 'WebviewWindow', label: this.label }
        });
    }
    /**
     * Listen to an emitted event on this webview window only once.
     *
     * @example
     * ```typescript
     * import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
     * const unlisten = await WebviewWindow.getCurrent().once<null>('initialized', (event) => {
     *   console.log(`Webview initialized!`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     */
    async once(event, handler) {
        if (this._handleTauriEvent(event, handler)) {
            return () => {
                // eslint-disable-next-line security/detect-object-injection
                const listeners = this.listeners[event];
                listeners.splice(listeners.indexOf(handler), 1);
            };
        }
        return once(event, handler, {
            target: { kind: 'WebviewWindow', label: this.label }
        });
    }
    /**
     * Set the window and webview background color.
     *
     * #### Platform-specific:
     *
     * - **Android / iOS:** Unsupported for the window layer.
     * - **macOS / iOS**: Not implemented for the webview layer.
     * - **Windows**:
     *   - alpha channel is ignored for the window layer.
     *   - On Windows 7, alpha channel is ignored for the webview layer.
     *   - On Windows 8 and newer, if alpha channel is not `0`, it will be ignored.
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.1.0
     */
    async setBackgroundColor(color) {
        return invoke('plugin:window|set_background_color', { color }).then(() => {
            return invoke('plugin:webview|set_webview_background_color', { color });
        });
    }
}
// Order matters, we use window APIs by default
applyMixins(WebviewWindow, [Window, Webview]);
/** Extends a base class by other specified classes, without overriding existing properties */
function applyMixins(baseClass, extendedClasses) {
    (Array.isArray(extendedClasses)
        ? extendedClasses
        : [extendedClasses]).forEach((extendedClass) => {
        Object.getOwnPropertyNames(extendedClass.prototype).forEach((name) => {
            var _a;
            if (typeof baseClass.prototype === 'object' &&
                baseClass.prototype &&
                name in baseClass.prototype)
                return;
            Object.defineProperty(baseClass.prototype, name, 
            // eslint-disable-next-line
            (_a = Object.getOwnPropertyDescriptor(extendedClass.prototype, name)) !== null && _a !== void 0 ? _a : Object.create(null));
        });
    });
}

function createTitleBarContainer() {
    let tbEl = document.querySelector("[data-tauri-decorum-tb]");
    if (tbEl)
        return null;
    console.log("DECORUM: Element with data-tauri-decorum-tb not found. Creating one.");
    // Create titlebar element
    tbEl = document.createElement("div");
    tbEl.setAttribute("data-tauri-decorum-tb", "");
    tbEl.style.top = '0px';
    tbEl.style.left = '0px';
    tbEl.style.zIndex = '100';
    tbEl.style.width = "100%";
    tbEl.style.height = "32px";
    tbEl.style.display = "flex";
    tbEl.style.position = "fixed";
    tbEl.style.alignItems = "end";
    tbEl.style.justifyContent = "end";
    tbEl.style.backgroundColor = "transparent";
    // Create draggable area
    const drag = document.createElement("div");
    drag.style.width = "100%";
    drag.style.height = "100%";
    drag.style.background = "transparent";
    drag.setAttribute("data-tauri-drag-region", "");
    tbEl.appendChild(drag);
    // add tbEl to the body
    document.body.appendChild(tbEl);
    return tbEl;
}
function createTitleBarControls(container, win) {
    const createControlButton = (id) => {
        const btn = document.createElement("button");
        btn.id = "decorum-tb-" + id;
        btn.classList.add("decorum-tb-btn");
        let timer;
        const show_snap_overlay = () => {
            win.setFocus().then(() => invoke("plugin:decorum|show_snap_overlay"));
        };
        switch (id) {
            case "minimize":
                btn.innerHTML = "\uE921";
                btn.addEventListener("click", () => {
                    clearTimeout(timer);
                    win.minimize();
                });
                break;
            case "maximize":
                btn.innerHTML = "\uE922";
                win.onResized(() => {
                    win.isMaximized().then((maximized) => {
                        if (maximized) {
                            btn.innerHTML = "\uE923";
                        }
                        else {
                            btn.innerHTML = "\uE922";
                        }
                    });
                });
                btn.addEventListener("click", () => {
                    clearTimeout(timer);
                    win.toggleMaximize();
                });
                btn.addEventListener("mouseleave", () => clearTimeout(timer));
                btn.addEventListener("mouseenter", () => {
                    timer = setTimeout(show_snap_overlay, 620);
                });
                break;
            case "close":
                btn.innerHTML = "\uE8BB";
                btn.addEventListener("click", () => win.close());
                break;
        }
        return btn;
    };
    ["minimize", "maximize", "close"].forEach((id) => {
        container.appendChild(createControlButton(id));
    });
}
function createTitleBar() {
    const container = createTitleBarContainer();
    if (!container)
        return;
    const win = getCurrentWindow();
    createTitleBarControls(container, win);
    const style = document.createElement("style");
    document.head.appendChild(style);
    style.innerHTML = `
    .decorum-tb-btn {
      cursor: default;
      width: 58px;
      height: 32px;
      border: none;
      padding: 0px;
      outline: none;
      display: flex;
      font-size: 10px;
      font-weight: 300;
      box-shadow: none;
      border-radius: 0;
      align-items: center;
      justify-content: center;
      transition: background 0.1s;
      background-color: transparent;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      font-family: 'Segoe Fluent Icons', 'Segoe MDL2 Assets';
    }

    .decorum-tb-btn:hover {
      background-color: rgba(0,0,0,0.2);
    }

    #decorum-tb-close:hover {
      background-color: rgba(255,0,0,0.7) !important;
    }
  `;
}
document.addEventListener("DOMContentLoaded", () => {
    createTitleBar();
});
