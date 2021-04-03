//

import {
  Button,
  InputGroup,
  NumericInput,
  Tab,
  Tabs,
  Toaster
} from "@blueprintjs/core";
import * as react from "react";
import {
  MouseEvent,
  ReactElement,
  ReactNode
} from "react";
import {
  Controlled as CodeMirror
} from "react-codemirror2";
import {
  PlainWord,
  Word
} from "../../module/dictionary";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class WordEditor extends Component<Props, State> {

  public constructor(props: Props) {
    super(props);
    let uid = props.word?.uid ?? null;
    let word = (props.defaultWord !== undefined) ? props.defaultWord : (props.word !== null) ? props.word : Word.createEmpty();
    let originalUniqueName = props.word?.uniqueName ?? null;
    this.state = {uid, word, originalUniqueName};
  }

  private handleCancel(event: MouseEvent<HTMLElement>): void {
    if (this.props.onCancel) {
      this.props.onCancel(event);
    }
  }

  private async handleConfirm(event: MouseEvent<HTMLElement>): Promise<void> {
    let errorType = await window.api.sendAsync("validate-edit-word", this.state.uid, this.state.word);
    if (errorType === null) {
      if (this.props.onConfirm) {
        this.props.onConfirm(this.state.uid, this.state.word, event);
      }
    } else {
      if (errorType === "invalidUniqueName") {
        CustomToaster.show({message: this.trans("wordEditor.invalidUniqueName"), icon: "error", intent: "danger"});
      } else if (errorType === "duplicateUniqueName") {
        CustomToaster.show({message: this.trans("wordEditor.duplicateUniqueName"), icon: "error", intent: "danger"});
      } else {
        CustomToaster.show({message: this.trans("wordEditor.error"), icon: "error", intent: "danger"});
      }
    }
  }

  private handleDelete(event: MouseEvent<HTMLElement>): void {
    if (this.props.onDelete) {
      this.props.onDelete(this.state.uid!, event);
    }
  }

  private setWord<T extends Array<unknown>>(setter: (...args: T) => void): (...args: T) => void {
    let outerThis = this;
    let wrapper = function (...args: T): void {
      setter(...args);
      let word = outerThis.state.word;
      outerThis.setState({word});
    };
    return wrapper;
  }

  public renderEditor(language: string): ReactElement {
    let word = this.state.word;
    let node = (
      <div className="zp-word-editor-tab zp-editor-tab" key={language}>
        <div className="zp-word-editor-head">
          <InputGroup fill={true} value={word.uniqueName} onChange={this.setWord((event) => word.uniqueName = event.target.value)}/>
          <NumericInput className="zp-word-editor-date" value={word.date} minorStepSize={null} onValueChange={this.setWord((date) => word.date = Math.floor(date))}/>
        </div>
        <CodeMirror
          className="zp-word-editor-content"
          value={word.contents[language] ?? ""}
          options={{theme: "zpshcontent", mode: {name: "shcontent"}, lineWrapping: true}}
          onBeforeChange={this.setWord((editor, data, value) => word.contents[language] = value)}
        />
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let languages = ["ja", "en"];
    let tabNodes = languages.map((language) => {
      let editorNode = this.renderEditor(language);
      let tabNode = (
        <Tab id={language} title={this.trans(`common.language.${language}`)} panel={editorNode}/>
      );
      return tabNode;
    });
    let node = (
      <div className="zp-word-editor zp-editor">
        <Tabs defaultSelectedTabId="ja" renderActiveTabPanelOnly={true}>
          {tabNodes}
        </Tabs>
        <div className="zp-word-editor-button zp-editor-button">
          <Button text={this.trans("wordEditor.cancel")} onClick={this.handleCancel.bind(this)}/>
          <Button text={this.trans("wordEditor.confirm")} intent="primary" onClick={this.handleConfirm.bind(this)}/>
        </div>
      </div>
    );
    return node;
  }

}


type Props = {
  word: PlainWord | null,
  defaultWord?: PlainWord,
  onConfirm?: (uid: string | null, word: PlainWord, event: MouseEvent<HTMLElement>) => void,
  onDelete?: (uid: string, event: MouseEvent<HTMLElement>) => void,
  onCancel?: (event: MouseEvent<HTMLElement>) => void
};
type State = {
  uid: string | null,
  word: PlainWord,
  originalUniqueName: string | null
};

let CustomToaster = Toaster.create({className: "zp-word-editor-toaster", position: "top", maxToasts: 2});