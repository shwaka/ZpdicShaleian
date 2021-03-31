//

import {
  promises as fs
} from "fs";
import {
  join as joinPath
} from "path";
import {
  Dictionary
} from "../dictionary";
import {
  DictionarySettings
} from "../dictionary-settings";
import {
  Markers
} from "../marker";
import {
  Word
} from "../word";
import {
  Saver
} from "./saver";


export class DirectorySaver extends Saver {

  private size: number = 0;
  private count: number = 0;
  private deleteSize: number = 0;
  private deleteCount: number = 0;

  public constructor(dictionary: Dictionary, path?: string | null) {
    super(dictionary, path);
  }

  public start(): void {
    let promise = Promise.resolve().then(this.deleteFiles.bind(this)).then(this.saveDictionary.bind(this));
    promise.then(() => {
      this.emit("end");
    }).catch((error) => {
      this.emit("error", error);
    });
  }

  private async deleteFiles(): Promise<void> {
    let paths = await fs.readdir(this.path);
    let fileLocalPaths = paths.filter((path) => path.endsWith(".nxdw") || path.endsWith(".nxds"));
    this.size = this.dictionary.words.length;
    this.deleteSize = fileLocalPaths.length;
    let promises = fileLocalPaths.map((fileLocalPath) => {
      let filePath = joinPath(this.path, fileLocalPath);
      return this.deleteFile(filePath);
    });
    await Promise.all(promises);
  }

  private async deleteFile(path: string): Promise<void> {
    await fs.unlink(path);
    this.deleteCount ++;
    this.emitProgress();
  }

  private async saveDictionary(): Promise<void> {
    let dictionary = this.dictionary;
    await fs.mkdir(this.path, {recursive: true});
    let wordsPromise = this.saveWords(dictionary.words);
    let settingsPromise = this.saveSettings(dictionary.settings);
    let markersPromise = this.saveMarkers(dictionary.markers);
    await Promise.all([wordsPromise, settingsPromise, markersPromise]);
  }

  private async saveWords(words: Array<Word>): Promise<void> {
    let promises = words.map((word) => {
      let wordPath = joinPath(this.path, word.getFileName() + ".nxdw");
      return this.saveWord(word, wordPath);
    });
    await Promise.all(promises);
  }

  private async saveWord(word: Word, path: string): Promise<void> {
    let string = word.toString();
    await fs.writeFile(path, string, {encoding: "utf-8"});
    this.count ++;
    this.emitProgress();
  }

  private async saveSettings(settings: DictionarySettings): Promise<void> {
    let path = joinPath(this.path, "$SETTINGS.nxds");
    let string = settings.toString();
    await fs.writeFile(path, string, {encoding: "utf-8"});
    this.emitProgress();
  }

  private async saveMarkers(markers: Markers): Promise<void> {
    let path = joinPath(this.path, "$MARKER.nxds");
    let string = markers.toString();
    await fs.writeFile(path, string, {encoding: "utf-8"});
    this.emitProgress();
  }

  private emitProgress(): void {
    this.emit("progress", this.count + this.deleteCount, this.size + this.deleteSize);
  }

}