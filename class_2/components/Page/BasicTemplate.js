import Premise from './Premise';
import React from 'react';

import {Header, SectionHeader} from 'cm-apptudio-ui';

class BasicTemplate extends Premise {
  render () {

    return <div className="page">
      <Header HeaderTitle="Title of the page" HeaderDescription="Description of the page/action/any info about the page"></Header>

      <div className="row">
        <div className="col-md-12">
          <p>This is sample paragraph. Examples are shown below. Copy codes from here to implement in your project. Strictly follow the uses of menu, header and container classes. Following guidelines are to be followed when you work on any project:</p>
          <ul>
            <li>In all places use col-md not col-xs in general. <span className="label label-danger">Mandatory</span></li>
            <li>
              In any <strong>page component</strong> wrap your html inside. Page defines the width of the page. So it can be adjusted if needed.  <span className="label label-danger">Mandatory</span>
              <pre>
                &lt;div className="page"&gt;&lt;/div&gt;
              </pre>
            </li>
            <li>
              The bare minimum code for page component is:  <span className="label label-danger">Mandatory</span>

              <pre className="pre-fixed">
                &lt;div className="page"&gt;<br/>
                  &lt;Header HeaderTitle="Title of the page" HeaderDescription="Description of the page/action/any info about the page"&gt;&lt;/Header&gt;<br/>
                &lt;/div&gt;
              </pre>

            </li>
          </ul>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Panels</h2>
          <div className="row">
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Panel title</h3>
                </div>
                <div className="panel-body">
                  Basic panel example. Panels can be used to wrap around any block to show as a common area.
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-heading">
                  Panel heading without title
                </div>
                <div className="panel-body">
                  Basic panel example. Panels can be used to wrap around any block to show as a common area.
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-body">
                  Basic panel example. Panels can be used to wrap around any block to show as a common area.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Header elements</h2>
          <h1>h1 header element</h1>
          <h2>h2 header element</h2>
          <h3>h3 header element</h3>
          <h4>h4 header element</h4>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Tabs</h2>
          <ul className="nav nav-tabs">
            <li role="presentation" className="active"><a href="#">Home</a></li>
            <li role="presentation"><a href="#">Profile</a></li>
            <li role="presentation"><a href="#">Messages</a></li>
          </ul>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Thumbnail</h2>
          <div className="row">
            <div className="col-xs-6 col-md-3">
              <a href="#" className="thumbnail">
                <img src="images/person3.png" alt="..."/>
              </a>
            </div>
            <div className="col-xs-6 col-md-3">
              <a href="#" className="thumbnail">
                <img src="images/person3.png" alt="..."/>
              </a>
            </div>
            <div className="col-xs-6 col-md-3">
              <a href="#" className="thumbnail">
                <img src="images/person3.png" alt="..."/>
              </a>
            </div>
            <div className="col-xs-6 col-md-3">
              <a href="#" className="thumbnail">
                <img src="images/person3.png" alt="..."/>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h2>Comments</h2>
          <div className="media">
            <div className="media-left">
              <a href="#">
                <img className="media-object" width="64" src="images/person.png" alt="..."/>
              </a>
            </div>
            <div className="media-body">
              <h4 className="media-heading">Media heading</h4>
              Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
            </div>
          </div>

          <div className="media">
            <div className="media-left">
              <a href="#">
                <img className="media-object" width="64" src="images/person.png" alt="..."/>
              </a>
            </div>
            <div className="media-body">
              <h4 className="media-heading">Media heading</h4>
              Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.

              <div className="media">
                <div className="media-left">
                  <a href="#">
                    <img className="media-object" width="64" src="images/person.png" alt="..."/>
                  </a>
                </div>
                <div className="media-body">
                  <h4 className="media-heading">Media heading</h4>
                  Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Single Column</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dictum leo facilisis, facilisis sapien in, aliquam sem. Suspendisse pulvinar felis enim, euismod malesuada turpis scelerisque at. Phasellus porttitor placerat tellus, eu dignissim neque dapibus vel. Curabitur euismod sed massa in venenatis. Vestibulum sed vulputate felis. Mauris tempus, est et sodales consectetur, risus nisi luctus libero, a pellentesque dui mauris eu ante. Curabitur vulputate eleifend pulvinar. Sed posuere mauris nec arcu lacinia, sed rhoncus ex interdum. Nullam et elit facilisis, dapibus arcu nec, facilisis massa.</p>
          <p>Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris auctor accumsan diam non vulputate. Pellentesque lacinia semper molestie. Aliquam vitae vestibulum ex, a vehicula ex. Nullam metus felis, egestas eu felis nec, volutpat molestie nisi. Duis efficitur eros justo, pretium rutrum lorem vehicula in. In aliquam sollicitudin ligula a luctus. Maecenas vel magna nec tellus viverra convallis. Nulla vitae enim eu tortor volutpat mollis. Nullam euismod eleifend magna ac tristique. Maecenas turpis velit, volutpat sit amet nisl sed, auctor ornare ex.</p>
          <p>Nunc pharetra imperdiet sollicitudin. Vestibulum sit amet euismod purus, in tincidunt elit. Maecenas id turpis in quam tincidunt tincidunt sit amet malesuada libero. In sed nulla cursus, hendrerit purus quis, posuere turpis. Donec lobortis in felis ac cursus. Nunc convallis blandit ante, id fringilla nisl pellentesque id. Vivamus euismod vel lacus dictum cursus. Etiam mi massa, egestas ut sapien et, tincidunt congue lorem. Pellentesque id diam nisl. Fusce a iaculis augue. Cras felis tortor, commodo nec mollis ut, porttitor hendrerit nibh. Proin mauris arcu, vehicula quis dignissim id, suscipit ac ipsum. Fusce vestibulum dapibus elit quis dictum. Nunc fermentum in elit et feugiat.</p>
          <p>Suspendisse imperdiet risus cursus fringilla porttitor. Phasellus eu pharetra magna. Pellentesque porttitor sem odio, ut cursus lorem sodales posuere. Sed ut pharetra mi. Proin faucibus volutpat metus, at feugiat erat pulvinar at. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque rutrum viverra risus, volutpat rutrum ligula ultrices ut. Donec congue massa eget massa lobortis maximus. Morbi vulputate fringilla pretium. Morbi commodo nisi quis sapien mattis tincidunt. Donec et dui at odio porttitor bibendum nec vitae ex. Praesent faucibus placerat massa.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h2>Double Column</h2>
          <div className="row">
            <div className="col-md-6">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dictum leo facilisis, facilisis sapien in, aliquam sem. Suspendisse pulvinar felis enim, euismod malesuada turpis scelerisque at. Phasellus porttitor placerat tellus, eu dignissim neque dapibus vel. Curabitur euismod sed massa in venenatis. Vestibulum sed vulputate felis. Mauris tempus, est et sodales consectetur, risus nisi luctus libero, a pellentesque dui mauris eu ante. Curabitur vulputate eleifend pulvinar. Sed posuere mauris nec arcu lacinia, sed rhoncus ex interdum. Nullam et elit facilisis, dapibus arcu nec, facilisis massa.</p>
              <p>Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris auctor accumsan diam non vulputate. Pellentesque lacinia semper molestie. Aliquam vitae vestibulum ex, a vehicula ex. Nullam metus felis, egestas eu felis nec, volutpat molestie nisi. Duis efficitur eros justo, pretium rutrum lorem vehicula in. In aliquam sollicitudin ligula a luctus. Maecenas vel magna nec tellus viverra convallis. Nulla vitae enim eu tortor volutpat mollis. Nullam euismod eleifend magna ac tristique. Maecenas turpis velit, volutpat sit amet nisl sed, auctor ornare ex.</p>
              <p>Nunc pharetra imperdiet sollicitudin. Vestibulum sit amet euismod purus, in tincidunt elit. Maecenas id turpis in quam tincidunt tincidunt sit amet malesuada libero. In sed nulla cursus, hendrerit purus quis, posuere turpis. Donec lobortis in felis ac cursus. Nunc convallis blandit ante, id fringilla nisl pellentesque id. Vivamus euismod vel lacus dictum cursus. Etiam mi massa, egestas ut sapien et, tincidunt congue lorem. Pellentesque id diam nisl. Fusce a iaculis augue. Cras felis tortor, commodo nec mollis ut, porttitor hendrerit nibh. Proin mauris arcu, vehicula quis dignissim id, suscipit ac ipsum. Fusce vestibulum dapibus elit quis dictum. Nunc fermentum in elit et feugiat.</p>
              <p>Suspendisse imperdiet risus cursus fringilla porttitor. Phasellus eu pharetra magna. Pellentesque porttitor sem odio, ut cursus lorem sodales posuere. Sed ut pharetra mi. Proin faucibus volutpat metus, at feugiat erat pulvinar at. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque rutrum viverra risus, volutpat rutrum ligula ultrices ut. Donec congue massa eget massa lobortis maximus. Morbi vulputate fringilla pretium. Morbi commodo nisi quis sapien mattis tincidunt. Donec et dui at odio porttitor bibendum nec vitae ex. Praesent faucibus placerat massa.</p>
            </div>
            <div className="col-md-6">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dictum leo facilisis, facilisis sapien in, aliquam sem. Suspendisse pulvinar felis enim, euismod malesuada turpis scelerisque at. Phasellus porttitor placerat tellus, eu dignissim neque dapibus vel. Curabitur euismod sed massa in venenatis. Vestibulum sed vulputate felis. Mauris tempus, est et sodales consectetur, risus nisi luctus libero, a pellentesque dui mauris eu ante. Curabitur vulputate eleifend pulvinar. Sed posuere mauris nec arcu lacinia, sed rhoncus ex interdum. Nullam et elit facilisis, dapibus arcu nec, facilisis massa.</p>
              <p>Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris auctor accumsan diam non vulputate. Pellentesque lacinia semper molestie. Aliquam vitae vestibulum ex, a vehicula ex. Nullam metus felis, egestas eu felis nec, volutpat molestie nisi. Duis efficitur eros justo, pretium rutrum lorem vehicula in. In aliquam sollicitudin ligula a luctus. Maecenas vel magna nec tellus viverra convallis. Nulla vitae enim eu tortor volutpat mollis. Nullam euismod eleifend magna ac tristique. Maecenas turpis velit, volutpat sit amet nisl sed, auctor ornare ex.</p>
              <p>Nunc pharetra imperdiet sollicitudin. Vestibulum sit amet euismod purus, in tincidunt elit. Maecenas id turpis in quam tincidunt tincidunt sit amet malesuada libero. In sed nulla cursus, hendrerit purus quis, posuere turpis. Donec lobortis in felis ac cursus. Nunc convallis blandit ante, id fringilla nisl pellentesque id. Vivamus euismod vel lacus dictum cursus. Etiam mi massa, egestas ut sapien et, tincidunt congue lorem. Pellentesque id diam nisl. Fusce a iaculis augue. Cras felis tortor, commodo nec mollis ut, porttitor hendrerit nibh. Proin mauris arcu, vehicula quis dignissim id, suscipit ac ipsum. Fusce vestibulum dapibus elit quis dictum. Nunc fermentum in elit et feugiat.</p>
              <p>Suspendisse imperdiet risus cursus fringilla porttitor. Phasellus eu pharetra magna. Pellentesque porttitor sem odio, ut cursus lorem sodales posuere. Sed ut pharetra mi. Proin faucibus volutpat metus, at feugiat erat pulvinar at. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque rutrum viverra risus, volutpat rutrum ligula ultrices ut. Donec congue massa eget massa lobortis maximus. Morbi vulputate fringilla pretium. Morbi commodo nisi quis sapien mattis tincidunt. Donec et dui at odio porttitor bibendum nec vitae ex. Praesent faucibus placerat massa.</p>
            </div>
          </div>
        </div>
      </div>

    </div>;
  }
}

export default BasicTemplate;
