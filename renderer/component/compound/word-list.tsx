//

import partial from "lodash-es/partial";
import * as react from "react";
import {
  FocusEvent,
  MouseEvent,
  ReactNode
} from "react";
import InfiniteScroll from "react-infinite-scroller";
import {
  Dictionary,
  Marker,
  Word
} from "../../module";
import {
  Component
} from "../component";
import {
  WordPaneWrapper
} from "../compound";
import {
  component
} from "../decorator";


@component()
export class WordList extends Component<Props, State> {

  public state: State = {
    displayedWords: []
  };

  public constructor(props: Props) {
    super(props);
    let displayedWords = props.words.slice(0, 30);
    this.state = {displayedWords};
  }

  public componentDidUpdate(previousProps: any): void {
    if (this.props !== previousProps) {
      if (this.props.words !== previousProps.words) {
        let displayedWords = this.props.words.slice(0, 30);
        this.setState({displayedWords});
      } else {
        let displayedWords = this.state.displayedWords;
        this.setState({displayedWords});
      }
    }
  }

  public loadWords(page: number): void {
    let length = this.state.displayedWords.length;
    let displayedWords = this.props.words.slice(0, length + 30);
    this.setState({displayedWords});
  }

  public render(): ReactNode {
    let hasMore = this.props.words.length > this.state.displayedWords.length;
    let wordPanes = this.state.displayedWords.map((word) => {
      let wordPane = (
        <WordPaneWrapper
          key={word.uid}
          dictionary={this.props.dictionary}
          word={word}
          language={this.props.language}
          onCreate={this.props.onCreate}
          onInherit={this.props.onInherit && partial(this.props.onInherit, word)}
          onEdit={this.props.onEdit && partial(this.props.onEdit, word)}
          onDelete={this.props.onDelete && partial(this.props.onDelete, word)}
          onActivate={this.props.onActivate && partial(this.props.onActivate, word)}
          onMarkerToggled={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, word)}
          onLinkClick={this.props.onLinkClick}
        />
      );
      return wordPane;
    });
    let node = (
      <div className="zp-word-list" id="word-list">
        <InfiniteScroll
          loadMore={this.loadWords.bind(this)}
          hasMore={hasMore}
          initialLoad={false}
          useWindow={false}
          threshold={500}
          getScrollParent={() => document.getElementById("word-list-container")!}
        >
          {wordPanes}
        </InfiniteScroll>
      </div>
    );
    return node;
  }

}


type Props = {
  dictionary: Dictionary,
  words: Array<Word>,
  language: string,
  onCreate?: (event: MouseEvent<HTMLElement>) => void,
  onInherit?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onEdit?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onDelete?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onMarkerToggled?: (word: Word, marker: Marker) => void,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void,
  onActivate?: (activeWord: Word | null, event: FocusEvent<HTMLElement>) => void
};
type State = {
  displayedWords: Array<Word>
};