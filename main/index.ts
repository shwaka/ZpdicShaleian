//

import {
  App,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  app as electronApp
} from "electron";
import {
  client
} from "electron-connect";
import {
  promises as fs
} from "fs";
import {
  join as joinPath
} from "path";
import {
  Settings
} from "../renderer/module/settings";
import {
  BasicHandler,
  DictionaryHandler,
  GitHandler
} from "./handler";
import {
  BrowserWindowUtil
} from "./util/browser-window";


const COMMON_WINDOW_OPTIONS = {
  resizable: true,
  fullscreenable: false,
  autoHideMenuBar: true,
  acceptFirstMouse: true,
  useContentSize: true,
  title: "ZpDIC for Shaleian",
  backgroundColor: "#F5F8FA",
  webPreferences: {preload: joinPath(__dirname, "preload.js"), devTools: true}
};
const PRODUCTION_WINDOW_OPTIONS = {
  webPreferences: {preload: joinPath(__dirname, "preload.js"), devTools: false}
};


export class Main {

  public app: App;
  public settings!: Settings;
  public windows: Map<number, BrowserWindow>;
  public mainWindow: BrowserWindow | undefined;
  public props: Map<number, object>;

  public constructor(app: App) {
    this.app = app;
    this.windows = new Map();
    this.mainWindow = undefined;
    this.props = new Map();
  }

  public main(): void {
    this.setupEventHandlers();
    this.setupHandlers();
  }

  private setupEventHandlers(): void {
    this.app.on("ready", async () => {
      await this.loadSettings();
      this.createMainWindow();
    });
    this.app.on("activate", () => {
      if (this.windows.size <= 0) {
        this.createMainWindow();
      }
    });
    this.app.on("window-all-closed", async () => {
      await this.saveSettings();
      this.app.quit();
    });
  }

  private setupHandlers(): void {
    BasicHandler.setup(this);
    GitHandler.setup(this);
    DictionaryHandler.setup(this);
  }

  private async loadSettings(): Promise<void> {
    let path = (this.app.isPackaged) ? "./settings.json" : "./dist/settings.json";
    try {
      let string = await fs.readFile(path, {encoding: "utf-8"});
      let settings = new Settings(JSON.parse(string));
      this.settings = settings;
    } catch (error) {
      this.settings = Settings.createEmpty();
    }
  }

  private async saveSettings(): Promise<void> {
    let path = (this.app.isPackaged) ? "./settings.json" : "./dist/settings.json";
    try {
      let string = JSON.stringify(this.settings, null, 2);
      await fs.writeFile(path, string, {encoding: "utf-8"});
    } catch (error) {
      console.error(error);
    }
  }

  public createWindow(mode: string, parentId: number | null, props: object, options: BrowserWindowConstructorOptions & {query?: Record<string, string>}): BrowserWindow {
    let show = false;
    let parent = (parentId !== null) ? this.windows.get(parentId) : undefined;
    let additionalOptions = (!this.app.isPackaged) ? {} : PRODUCTION_WINDOW_OPTIONS;
    let window = new BrowserWindow({...COMMON_WINDOW_OPTIONS, ...additionalOptions, show, parent, ...options});
    if (parent !== undefined) {
      BrowserWindowUtil.centerToParent(parent, window);
    }
    let id = window.id;
    let idString = id.toString();
    window.loadFile(joinPath(__dirname, "index.html"), {query: {...options.query, mode, idString}});
    window.setMenu(null);
    window.show();
    window.once("closed", () => {
      this.windows.delete(id);
    });
    this.windows.set(id, window);
    this.props.set(id, props);
    return window;
  }

  private createMainWindow(): BrowserWindow {
    let options = {width: 720, height: 720, minWidth: 640, minHeight: 480};
    let window = this.createWindow("main", null, {}, options);
    this.mainWindow = window;
    this.connectReloadClient(window);
    return window;
  }

  private connectReloadClient(window: BrowserWindow): void {
    if (!this.app.isPackaged) {
      client.create(window, {}, () => {
        console.log("Reload client connected");
      });
    }
  }

}


let main = new Main(electronApp);
main.main();